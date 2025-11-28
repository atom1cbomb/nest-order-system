// [订单服务] 订单核心交易逻辑与自动接单判断实现
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

/**
 * [订单服务层]
 * 封装订单模块的核心业务逻辑，处理数据库交互、事务管理及实时消息推送。
 */
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  /**
   * [创建订单]
   * 执行事务操作：扣减库存、生成取餐号、创建订单记录，并通过 WebSocket 通知管理端。
   */
  async create(userId: number, createOrderDto: any) {
    const { items, totalPrice, tableNumber } = createOrderDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. 校验库存并扣减
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < 1) {
          throw new Error(`菜品 ${item.name} 库存不足`);
        }
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: 1 } }
        });
      }

      // 2. 读取系统配置：判断是否自动接单
      let initialStatus = 0; 
      try {
        const config = await tx.systemConfig.findUnique({
          where: { key: 'auto_accept' }
        });
        if (config && config.value === 'true') {
          initialStatus = 1;
        }
      } catch (e) {}

      // 3. 生成当天唯一的取餐号 (例如: A001)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const count = await tx.order.count({
        where: { createTime: { gte: startOfDay } }
      });
      const pickupNo = 'A' + (count + 1).toString().padStart(3, '0');

      // 4. 创建订单主表及关联的子项
      const order = await tx.order.create({
        data: {
          totalPrice,
          userId,
          tableNumber,
          pickupNo,
          status: initialStatus,
          items: {
            create: items.map((item: any) => ({
              productName: item.name,
              price: item.price,
              count: 1 // 目前前端传的是展开后的数组，每个item数量为1
            })),
          },
        },
        include: { items: true, user: true }
      });

      const statusText = initialStatus === 1 ? '自动接单' : '待接单';
      console.log(`🔥🔥🔥 新订单: ID[${order.id}] 取餐号[${pickupNo}] 状态[${statusText}]`);
      
      // 5. 推送实时消息
      this.eventsGateway.sendNewOrderEvent(order);
      return order;
    });
  }

  /**
   * [查询所有订单]
   * 根据筛选条件返回订单列表。
   */
  findAll(query: any = {}) {
    const { startDate, endDate, userId, minPrice, maxPrice } = query;
    const where: any = {};

    if (startDate && endDate) {
      where.createTime = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (userId) where.userId = Number(userId);
    if (minPrice || maxPrice) {
      where.totalPrice = {};
      if (minPrice) where.totalPrice.gte = Number(minPrice) * 100;
      if (maxPrice) where.totalPrice.lte = Number(maxPrice) * 100;
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { createTime: 'desc' },
      include: { items: true, user: true }
    });
  }

  /**
   * [查询我的订单]
   */
  findMine(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createTime: 'desc' },
      include: { items: true }
    });
  }

  /**
   * [查询单条详情]
   */
  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true }
    });
  }

  /**
   * [更新订单]
   */
  async update(id: number, updateOrderDto: any) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
    // 可以选择在此处也推送更新事件
    // this.eventsGateway.server.emit('orderUpdated', order);
    return order;
  }

  /**
   * [删除订单]
   */
  remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }

  /**
   * [核心统计逻辑]
   * 聚合计算看板所需的关键指标。
   */
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. 基础数据计数（并行查询以提高性能）
    const [
      todayOrders,
      todayRevenueResult,
      yesterdayOrders,
      yesterdayRevenueResult,
      totalProducts,
      totalUsers
    ] = await Promise.all([
      // 今日订单数
      this.prisma.order.count({ where: { createTime: { gte: today } } }),
      // 今日营收总额
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { createTime: { gte: today } }
      }),
      // 昨日订单数 (用于计算环比)
      this.prisma.order.count({
        where: { createTime: { gte: yesterday, lt: today } }
      }),
      // 昨日营收总额
      this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { createTime: { gte: yesterday, lt: today } }
      }),
      // 总商品数
      this.prisma.product.count(),
      // 总用户数
      this.prisma.user.count(),
    ]);

    const todayRevenue = todayRevenueResult._sum.totalPrice || 0;
    const yesterdayRevenue = yesterdayRevenueResult._sum.totalPrice || 0;

    // 2. 计算七日营收趋势
    const trendData: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const dailyRev = await this.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { createTime: { gte: date, lt: nextDate } }
      });

      trendData.push({
        date: `${date.getMonth() + 1}-${date.getDate()}`,
        value: (dailyRev._sum.totalPrice || 0) / 100
      });
    }

    // 3. 计算分类销量占比
    // 逻辑：获取所有订单详情 -> 关联商品 -> 关联分类 -> 聚合统计
    // 注意：由于 Prisma 暂不支持深度嵌套的 groupBy，这里采用先查出所有项在内存聚合的方式（数据量大时需优化为原生 SQL）
    const allOrderItems = await this.prisma.orderItem.findMany({
      select: { productName: true }
    });

    // 获取所有商品及其分类信息
    const products = await this.prisma.product.findMany({
      include: { category: true }
    });

    // 建立 商品名 -> 分类名 的映射
    const productCategoryMap = new Map();
    products.forEach(p => {
      if (p.category) {
        productCategoryMap.set(p.name, p.category.name);
      }
    });

    // 统计各分类数量
    const categoryStats: Record<string, number> = {};
    allOrderItems.forEach(item => {
      const catName = productCategoryMap.get(item.productName) || '其他';
      categoryStats[catName] = (categoryStats[catName] || 0) + 1;
    });

    const pieData = Object.keys(categoryStats).map(key => ({
      name: key,
      value: categoryStats[key]
    }));

    return {
      todayOrders,
      todayRevenue: todayRevenue / 100, // 转为元
      yesterdayOrders,
      yesterdayRevenue: yesterdayRevenue / 100,
      totalProducts,
      totalUsers,
      trend: trendData,
      categoryPie: pieData
    };
  }
}
// [订单服务] 订单核心交易逻辑与自动接单判断实现
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway
  ) {}

  // 1. 创建订单
  async create(userId: number, createOrderDto: any) {
    const { items, totalPrice, tableNumber } = createOrderDto;

    // 自动接单开关
    let initialStatus = 0; 
    

    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key: 'auto_accept' }
      });
      if (config && config.value === 'true') {
        initialStatus = 1; 
      }
    } catch (e) {

      console.log('读取自动接单配置失败，使用默认值');
    }


    const order = await this.prisma.order.create({
      data: {
        totalPrice,
        userId,
        tableNumber, 
        status: initialStatus,
        items: {
          create: items.map((item: any) => ({
            productName: item.name,
            price: item.price,
            count: 1
          })),
        },
      },
      include: { items: true, user: true }
    });

    const statusText = initialStatus === 1 ? '自动接单' : '待接单';
    console.log(`🔥🔥🔥 收到新订单: ID[${order.id}] 桌号[${tableNumber}] 状态[${statusText}]`);
    
    this.eventsGateway.sendNewOrderEvent(order);

    return order;
  }

  // 2. 查询所有订单 (支持筛选)
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

  // 3. 查询我的订单
  findMine(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createTime: 'desc' },
      include: { items: true }
    });
  }

  // 4. 更新状态
  async update(id: number, updateOrderDto: any) {
    const order = await this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });

    this.eventsGateway.server.emit('orderUpdated', order);
    return order;
  }
}
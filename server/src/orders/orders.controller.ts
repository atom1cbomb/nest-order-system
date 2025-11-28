// [订单控制] 订单创建、查询与状态流转控制器
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

/**
 * [订单控制器]
 * 定义订单模块的路由处理逻辑，包括创建、查询、状态更新及统计分析等接口。
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * [创建订单]
   * 接收客户端提交的订单数据（包含菜品项、总价、桌号等），调用服务层创建订单并触发实时通知。
   */
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // 假设当前用户ID为1（实际应从 AuthGuard 获取）
    const userId = 1; 
    return this.ordersService.create(userId, createOrderDto);
  }

  /**
   * [统计概览]
   * 获取系统运营的核心统计数据，包括今日营收、订单数、用户数及图表分析数据。
   * 注意：此路由必须定义在动态参数路由（:id）之前，以避免路由冲突。
   */
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  /**
   * [查询订单列表]
   * 支持通过日期范围、用户ID、金额区间等多维度条件筛选订单数据。
   */
  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  /**
   * [查询我的订单]
   * 获取当前登录用户的历史订单列表。
   */
  @Get('mine')
  findMine() {
    // 假设当前用户ID为1
    const userId = 1;
    return this.ordersService.findMine(userId);
  }

  /**
   * [查询订单详情]
   * 根据订单ID获取单条订单的详细信息。
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  /**
   * [更新订单状态]
   * 用于商家接单、完成制作等状态流转操作。
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  /**
   * [删除订单]
   * 物理删除指定ID的订单记录。
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

 
}
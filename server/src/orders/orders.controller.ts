/**
 * @file server/src/orders/orders.controller.ts
 * @description 订单控制器，处理订单的创建、查询、状态流转与统计接口
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

// 订单控制器，定义订单模块的路由处理逻辑。
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 创建订单，接收订单数据并调用服务层创建订单并触发实时通知。
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // 假设当前用户ID为1（实际应从 AuthGuard 获取）
    const userId = 1; 
    return this.ordersService.create(userId, createOrderDto);
  }

  // 统计概览，返回今日营收、订单数、用户数及相关图表分析数据。
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  // 查询订单列表，支持日期、用户和金额区间等筛选条件。
  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  // 查询我的订单，返回当前用户的历史订单列表。
  @Get('mine')
  findMine() {
    // 假设当前用户ID为1
    const userId = 1;
    return this.ordersService.findMine(userId);
  }

  // 查询订单详情，根据订单 ID 返回详细信息。
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  // 更新订单状态，用于接单或完成制作等状态流转操作。
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  // 删除订单，物理删除指定 ID 的订单记录。
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }

 
}
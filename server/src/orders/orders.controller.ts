// [订单控制] 订单创建、查询与状态流转控制器
import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport'; // 引入守卫

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // 1. 下单接口 
  @UseGuards(AuthGuard('jwt')) 
  @Post()
  create(@Request() req, @Body() createOrderDto: any) {
    const userId = req.user.userId;
    return this.ordersService.create(userId, createOrderDto);
  }

  // 2. 查询我的订单 
  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  findMine(@Request() req) {
    const userId = req.user.userId;
    return this.ordersService.findMine(userId);
  }

  // 3. 查询所有订单 (后台管理用，暂时不加保护，方便商家直接看)
  @Get()
  findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  // 4. 修改状态 (后台管理用)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: any) {
    return this.ordersService.update(id, updateOrderDto);
  }
}
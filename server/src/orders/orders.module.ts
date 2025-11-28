/**
 * @file server/src/orders/orders.module.ts
 * @description 订单模块，注册订单相关服务与网关
 */
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, EventsGateway],
})
export class OrdersModule {}
/**
 * @file server/src/orders/dto/update-order.dto.ts
 * @description 更新订单 DTO，继承自 CreateOrderDto 的可选字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

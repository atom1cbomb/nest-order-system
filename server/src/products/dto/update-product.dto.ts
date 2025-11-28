/**
 * @file server/src/products/dto/update-product.dto.ts
 * @description 更新产品 DTO，继承 CreateProductDto 的可选字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

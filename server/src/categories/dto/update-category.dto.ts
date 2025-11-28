/**
 * @file server/src/categories/dto/update-category.dto.ts
 * @description 更新分类 DTO，继承自 CreateCategoryDto 的可选字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

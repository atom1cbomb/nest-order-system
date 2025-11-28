/**
 * @file server/src/categories/dto/create-category.dto.ts
 * @description 创建分类 DTO，定义分类所需字段
 */
export class CreateCategoryDto {
  name: string;
  sort?: number; 
}
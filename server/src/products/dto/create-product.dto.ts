export class CreateProductDto {
  name: string;
  price: number; // 前端传过来是分
  description?: string;
  image?: string;
  stock?: number;
  categoryId: number; // 必须指定分类ID
}
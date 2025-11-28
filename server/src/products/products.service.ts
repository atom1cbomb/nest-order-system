/**
 * @file server/src/products/products.service.ts
 * @description 产品服务，负责菜品的 CRUD 与业务查询
 */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 创建菜品
  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  // 查询所有菜品（包含分类信息）
  findAll(status?: number) {
    const where = status !== undefined ? { status } : {};
    
    return this.prisma.product.findMany({
      where, 
      include: { category: true },
      orderBy: { createTime: 'desc' }
    });
  }

  // 根据分类ID查询菜品（小程序使用）
  findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId },
      orderBy: { id: 'desc' }
    });
  }

  findOne(id: number) { return `This action returns a #${id} product`; }
  update(id: number, updateProductDto: any) {
    return this.prisma.product.update({
      where: { id },        
      data: updateProductDto 
    });
  }
  remove(id: number) { return `This action removes a #${id} product`; }
}
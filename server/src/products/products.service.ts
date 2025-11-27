import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 1. 创建菜品
  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  // 2. 查询所有菜品 (包含分类信息)
  findAll() {
    return this.prisma.product.findMany({
      include: { category: true }, // <--- 关键：连表查询，把分类信息也带出来
      orderBy: { createTime: 'desc' }
    });
  }

  // 3. 根据分类ID查询菜品 (给小程序用的)
  findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId },
      orderBy: { id: 'desc' }
    });
  }

  findOne(id: number) { return `This action returns a #${id} product`; }
  update(id: number, updateProductDto: any) { return `This action updates a #${id} product`; }
  remove(id: number) { return `This action removes a #${id} product`; }
}
import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  // 依赖注入 PrismaService
  constructor(private prisma: PrismaService) {}

  // 1. 创建分类
  create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  // 2. 获取所有分类
  findAll() {
    return this.prisma.category.findMany({
      orderBy: { sort: 'asc' } // 按 sort 字段排序
    });
  }

  // 其他方法暂时留空，先跑通这两个
  findOne(id: number) { return `This action returns a #${id} category`; }
  update(id: number, updateCategoryDto: any) { return `This action updates a #${id} category`; }
  remove(id: number) { return `This action removes a #${id} category`; }
}
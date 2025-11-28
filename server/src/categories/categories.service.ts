import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto'; // 确保引入 DTO
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

  // 3. 获取单个分类 (已修复：实现真实查询)
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new HttpException('分类不存在', HttpStatus.NOT_FOUND);
    }
    return category;
  }

  // 4. 更新分类 (已修复：实现真实更新)
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
      });
    } catch (error) {
      throw new HttpException('更新失败，分类可能不存在', HttpStatus.BAD_REQUEST);
    }
  }

  // 5. 删除分类 (已修复：先检查关联，再真实删除)
  async remove(id: number) {
    // 步骤 A: 检查分类是否存在
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new HttpException('分类不存在', HttpStatus.NOT_FOUND);
    }

    // 步骤 B: 关键安全检查！查看该分类下是否还有菜品
    // 如果直接删除包含菜品的分类，数据库会报外键约束错误
    const productCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      // 返回 403 Forbidden 或 400 Bad Request，并告知前端具体原因
      throw new HttpException(
        `该分类下仍有 ${productCount} 个菜品，请先转移或删除菜品后再尝试`,
        HttpStatus.FORBIDDEN,
      );
    }

    // 步骤 C: 安全，执行删除
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
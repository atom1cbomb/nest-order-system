import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- 引入

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PrismaService] // <--- 注册在这里
})
export class CategoriesModule {}
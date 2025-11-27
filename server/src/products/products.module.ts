import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- 导入

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // <--- 注册
})
export class ProductsModule {}
import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- 1. 引入 PrismaService

@Module({
  controllers: [TablesController],
  providers: [TablesService, PrismaService], // <--- 2. 在 providers 数组里注册它
})
export class TablesModule {}
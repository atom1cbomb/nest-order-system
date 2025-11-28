/**
 * @file server/src/tables/tables.module.ts
 * @description 桌号模块，注册桌号服务与控制器
 */
import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- 1. 引入 PrismaService

@Module({
  controllers: [TablesController],
  providers: [TablesService, PrismaService], 
})
export class TablesModule {}
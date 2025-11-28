/**
 * @file server/src/configs/configs.module.ts
 * @description 配置模块，注册配置服务与控制器
 */
import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsService, PrismaService],
})
export class ConfigsModule {}
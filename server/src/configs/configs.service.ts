/**
 * @file server/src/configs/configs.service.ts
 * @description 配置服务，读取与更新系统参数
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigsService {
  constructor(private prisma: PrismaService) {}

  async findOne(key: string) {
    const config = await this.prisma.systemConfig.findUnique({ where: { key } });

    return config || { key, value: 'false' };
  }

  async update(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: '自动接单开关' },
    });
  }
}
// [配置服务] 系统参数的读取与持久化更新逻辑
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
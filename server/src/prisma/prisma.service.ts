/**
 * @file server/src/prisma/prisma.service.ts
 * @description Prisma 服务，用于数据库连接管理与生命周期钩子
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
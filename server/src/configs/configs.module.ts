import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import { PrismaService } from '../prisma/prisma.service'; // 👈 1. 引入

@Module({
  controllers: [ConfigsController],
  providers: [ConfigsService, PrismaService], // 👈 2. 必须注册！否则后端启动报错
})
export class ConfigsModule {}
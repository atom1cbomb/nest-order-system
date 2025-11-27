import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service'; // <--- 1. 引入 PrismaService

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService], 
})
export class UsersModule {}
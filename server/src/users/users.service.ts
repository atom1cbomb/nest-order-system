/**
 * @file server/src/users/users.service.ts
 * @description 用户服务，处理用户数据的查询与更新
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  update(id: number, updateUserDto: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }
}
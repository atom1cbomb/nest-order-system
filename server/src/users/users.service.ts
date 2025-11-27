// [用户服务] 用户数据持久化与业务逻辑处理
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
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  create(createTableDto: any) {
    return this.prisma.table.create({
      data: createTableDto,
    });
  }

  findAll() {
    // 按排序字段 sort 升序排列
    return this.prisma.table.findMany({
      orderBy: { sort: 'asc' }
    });
  }

  remove(id: number) {
    return this.prisma.table.delete({
      where: { id },
    });
  }
  
  // 占位
  findOne(id: number) { return `Action #${id}`; }
  update(id: number, updateTableDto: any) { return `Action #${id}`; }
}
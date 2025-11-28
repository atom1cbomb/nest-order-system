/**
 * @file server/src/tables/tables.controller.ts
 * @description 桌号控制器，提供桌号管理接口
 */
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  create(@Body() createTableDto: any) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tablesService.remove(+id);
  }
}
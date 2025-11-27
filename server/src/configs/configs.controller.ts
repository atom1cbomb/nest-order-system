// [配置控制] 系统全局开关（如自动接单）管理接口
import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { ConfigsService } from './configs.service';

@Controller('configs')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.configsService.findOne(key);
  }

  @Post()
  update(@Body() body: { key: string; value: string }) {
    return this.configsService.update(body.key, body.value);
  }
}
/**
 * @file server/src/configs/configs.controller.ts
 * @description 系统配置控制器，管理系统全局开关与配置项
 */
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
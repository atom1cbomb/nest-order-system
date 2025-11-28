/**
 * @file server/src/app.controller.ts
 * @description 应用根控制器，暴露基础健康检查或根路由
 */
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

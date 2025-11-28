/**
 * @file server/src/app.service.ts
 * @description 应用服务，提供基础应用服务方法
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

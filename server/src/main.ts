/**
 * @file server/src/main.ts
 * @description 后端服务入口，启动 NestJS 应用并配置全局中间件
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(); 
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
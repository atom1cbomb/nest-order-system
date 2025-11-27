// [后端服务入口文件] 后端服务启动入口与全局中间件配置
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors(); 
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
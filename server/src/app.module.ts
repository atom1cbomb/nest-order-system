// [根模块] 应用程序主模块与依赖注入注册中心
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { TablesModule } from './tables/tables.module';   // 👈 补回桌号
import { ConfigsModule } from './configs/configs.module'; // 👈 补回配置
import { UploadController } from './upload/upload.controller';

@Module({
  imports: [
    // 1. 静态资源
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // 2. 业务模块 
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    TablesModule, 
    ConfigsModule, 
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
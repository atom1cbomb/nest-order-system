import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // 稍后创建

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'my-secret-key-123', // 真实项目请放 .env
      signOptions: { expiresIn: '7d' }, // token 7天过期
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
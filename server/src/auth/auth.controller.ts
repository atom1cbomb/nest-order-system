/**
 * @file server/src/auth/auth.controller.ts
 * @description 认证控制器，提供微信登录接口
 */
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body('code') code: string) {
    return this.authService.login(code);
  }
}
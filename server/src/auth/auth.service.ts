/**
 * @file server/src/auth/auth.service.ts
 * @description 认证服务，处理微信登录与 JWT 令牌生成
 */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  // 微信登录
  async login(code: string) {
    const appId = process.env.WECHAT_APPID;
    const secret = process.env.WECHAT_SECRET;
    
    // 1.找微信换 openid
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    
    const { data } = await axios.get(url);
    
    if (data.errcode) {
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    const openid = data.openid;

    // 2. 在数据库查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openid }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { openid }
      });
    }

    // 3. 生成 JWT Token
    const payload = { sub: user.id, openid: user.openid };
    return {
      token: this.jwtService.sign(payload), 
      user
    };
  }
}
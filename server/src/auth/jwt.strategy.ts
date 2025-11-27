// [鉴权策略] JWT身份验证守卫与解析策略
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false,
      secretOrKey: 'my-secret-key-123', 
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, openid: payload.openid };
  }
}
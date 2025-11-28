/**
 * @file server/src/users/users.controller.ts
 * @description 用户控制器，提供个人资料查询与更新接口
 */
import { Controller, Get, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 获取我的资料
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  // 更新资料（头像、昵称）
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateUserDto: any) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }
}
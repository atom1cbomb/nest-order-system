// [用户控制] 用户个人资料查询与修改控制器
import { Controller, Get, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. 获取我的资料
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  // 2. 更新资料 (头像、昵称)
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateUserDto: any) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }
}
/**
 * @file server/src/users/dto/update-user.dto.ts
 * @description 更新用户 DTO，继承 CreateUserDto 的可选字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

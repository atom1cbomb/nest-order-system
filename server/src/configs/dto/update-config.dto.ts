/**
 * @file server/src/configs/dto/update-config.dto.ts
 * @description 更新配置 DTO，继承创建配置 DTO 的可选字段
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateConfigDto } from './create-config.dto';

export class UpdateConfigDto extends PartialType(CreateConfigDto) {}

/**
 * @file server/src/tables/dto/update-table.dto.ts
 * @description 更新餐桌 DTO
 */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTableDto } from './create-table.dto';

export class UpdateTableDto extends PartialType(CreateTableDto) {}

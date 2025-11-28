/**
 * @file server/src/products/products.controller.ts
 * @description 菜品控制器，提供菜品相关的 CRUD 接口
 */
import { Controller, Get, Post, Body, Patch, Param, Delete ,Query} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.productsService.findAll(status ? +status : undefined);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(+id, updateProductDto);
  }
}
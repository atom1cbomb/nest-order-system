/**
 * @file server/src/upload/upload.controller.ts
 * @description 上传模块控制器，处理静态资源上传与返回文件地址
 */
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      url: `http://localhost:3000/uploads/${file.filename}`
    };
  }
}
import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Authenticated } from '@app/auth';

import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe, ValidFreeSpace } from './pipes';
import * as multer from 'multer';

@Controller('my-storage')
@UseGuards(Authenticated)
export class StorageController {
  constructor() {}

  @Get()
  list() {
    return { demo: 'demo' };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: 'dist/uploads', //TOOD: use env
        filename: (req, file, cb) => {
          // const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const uri = encodeURIComponent(file.originalname);
          const filename = uri;
          //TODO: req on err not working
          cb(null, filename);
        },
      }),
    }),
  )
  uploadToMyStorage(
    @UploadedFile(FileValidationPipe, ValidFreeSpace) file: Express.Multer.File,
  ) {
    return { file };
  }

  // @Get(':id')
  // getContent(@Req() { user }: RequestWithUser) {}
}

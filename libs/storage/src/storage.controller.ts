import { Controller, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Authenticated } from '@app/auth';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage, RollbackFileUploaded } from './adapters';
import { Transactional } from '@nestjs-cls/transactional';

@Controller('my-storage')
@UseGuards(Authenticated)
export class StorageController {
  constructor() {}

  @Post()
  @UseGuards(Authenticated)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage }))
  @RollbackFileUploaded()
  @Transactional()
  uploadToMyStorage() {
    // @UploadedFile(FileValidationPipe) file: Express.Multer.FileExt,
    // const fileRef = FileRef.parse(file);
    // const result = addFile(root, fileRef.ownerId, fileRef);
    // if (E.isLeft(result)) throw getError(result.left);
    // const data = result.right[0].data;
    // addFileRepo(data.folderId, data.file);
    // return { success: true };
  }
}

// const errors = {
//   NotEnoughSpace: new BadRequestException('Not enough space'),
//   NotPermitted: new ForbiddenException('Not permitted'),
// } as const;

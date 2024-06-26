import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Transactional } from '@nestjs-cls/transactional';

import { Authenticated } from '@app/auth';
import { diskStorage } from './adapters';
import { StorageRepository } from './storage.repository';

@Controller('my-storage')
@UseGuards(Authenticated)
export class StorageController {
  constructor(private readonly storageRepo: StorageRepository) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage }))
  @Transactional()
  async uploadToMyStorage(@UploadedFile() file: Express.Multer.FileExt) {
    console.log('file', file);
  }
}

// =============================================== ============================== ===============================================
// @Post()
// @UseGuards(Authenticated)
// @UseInterceptors(FileInterceptor('file', { storage: diskStorage }))
// @RollbackFileUploaded()
// @Transactional()
// uploadToMyStorage() {
//   @UploadedFile(FileValidationPipe) file: Express.Multer.FileExt,
//   const fileRef = FileRef.parse(file);
//   const result = addFile(root, fileRef.ownerId, fileRef);
//   if (E.isLeft(result)) throw getError(result.left);
//   const data = result.right[0].data;
//   addFileRepo(data.folderId, data.file);
//   return { success: true };
// }

// const errors = {
//   NotEnoughSpace: new BadRequestException('Not enough space'),
//   NotPermitted: new ForbiddenException('Not permitted'),
// } as const;

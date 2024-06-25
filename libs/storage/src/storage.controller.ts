import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageRepository } from './storage.repository';
import { Transactional } from '@nestjs-cls/transactional';
import { v4 as uuid } from 'uuid';
import { Folder } from '@prisma/client';

@Controller('my-storage')
export class StorageController {
  constructor(private readonly storageRepo: StorageRepository) {}

  // get list
  @Get()
  async getMyStorage() {
    const userId = `73285bb0-8715-4810-8574-ade024ba51e8`;
    return await this.storageRepo.createRoot(userId, 'my-storage');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Transactional()
  async uploadToMyStorage() {
    const userId = `73285bb0-8715-4810-8574-ade024ba51e8`;
    const folder = {
      id: uuid(),
      name: 'my-storage',
      size: '0',
      ownerId: userId,
      createdAt: new Date(),
      archivedAt: null,
      rootId: userId,
      depth: 1,
      lft: 1,
      rgt: 2,
    };
    return await this.storageRepo.addFolder(folder);
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

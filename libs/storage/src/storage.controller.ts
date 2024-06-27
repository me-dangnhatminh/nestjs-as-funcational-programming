import {
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Transactional } from '@nestjs-cls/transactional';

import { Authenticated } from '@app/auth';
import { diskStorage, RollbackFileUploaded } from './adapters';
import { StorageRepository } from './storage.repository';
import { RequestWithUser } from 'express';
import { FileRef } from './domain';

// =================================
// TODO: move to a separate file
// this is BigInt serialization for JSON (error)
Object.assign(BigInt.prototype, {
  toJSON() {
    return this.toString();
  },
});
// =================================

@Controller('my-storage')
@UseGuards(Authenticated)
export class StorageController {
  constructor(private readonly storageRepo: StorageRepository) {}

  @Get()
  @Transactional()
  async getMyStorage(@Req() req: RequestWithUser) {
    const root = await this.storageRepo.getFolder(req.user.id);
    if (!root) throw new Error('Root not found');
    const result = await this.storageRepo.getContent(root, 1);
    return result;
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage }))
  @Transactional()
  @RollbackFileUploaded()
  async uploadToMyStorage(
    @Req() req: RequestWithUser,
    @UploadedFile() file: unknown,
  ) {
    const fileRef = FileRef.parse(file);
    const root = await this.storageRepo.getFolder(req.user.id);
    if (!root) throw new Error('Root not found');
    const result = await this.storageRepo.addFile(fileRef, root);
  }
}
// const root = await this.storageRepo.getFolder(
//   'ebf24c9d-647d-488e-a64e-5053316f2cd5',
// );
// // const root = await this.storageRepo.upsertRoot(req.user.id);
// if (!root) throw new Error('Root not found');
// // const folder1 = createFolder(req.user.id, 'folder-1', root.id);

// // return await this.storageRepo.addFolder(folder1, root);

// const folder100 = Array.from({ length: 200 }, (_, i) =>
//   createFolder(req.user.id, `folder-${i}`, root.id),
// );
// const time = Date.now();
// const result = await this.storageRepo.addFolders(folder100, root);
// console.log('Time:', Date.now() - time), 'ms';
// return result;

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

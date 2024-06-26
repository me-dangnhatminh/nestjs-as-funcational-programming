import { Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageRepository } from './storage.repository';
import { Transactional } from '@nestjs-cls/transactional';

@Controller('my-storage')
export class StorageController {
  constructor(private readonly storageRepo: StorageRepository) {}

  // get list
  @Get()
  async getMyStorage() {
    // const userId = `73285bb0-8715-4810-8574-ade024ba51e8`;
    // const newFolder = {
    //   id: uuid(),
    //   name: 'my-storage',
    //   size: '0',
    //   ownerId: userId,
    //   createdAt: new Date(),
    //   archivedAt: null,
    //   rootId: userId,
    // };
    // const root = await this.storageRepo.getFolderById(userId);
    // return await this.storageRepo.addToFolder(newFolder, root);
    // const userId = `73285bb0-8715-4810-8574-ade024ba51e8`;
    // return await this.storageRepo.createRoot(userId, 'my-storage');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Transactional()
  async uploadToMyStorage() {
    // const userId = `73285bb0-8715-4810-8574-ade024ba51e8`;
    // const newFolder = {
    //   id: uuid(),
    //   name: 'my-storage',
    //   size: '0',
    //   ownerId: userId,
    //   createdAt: new Date(),
    //   archivedAt: null,
    //   rootId: userId,
    // };
    // const root = await this.storageRepo.getFolderById(
    //   '27c52156-8d94-4218-8141-5db0112f52e3',
    // );
    // return await this.storageRepo.addToFolder(newFolder, root);
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

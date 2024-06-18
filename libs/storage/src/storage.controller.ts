import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Authenticated } from '@app/auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { Either as E } from 'effect';

import { addFile, FileRef, FolderAgg, StorageRoot } from './domain';
import { FileValidationPipe } from './pipes';
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
  uploadToMyStorage(
    @UploadedFile(FileValidationPipe) file: Express.Multer.FileExt,
  ) {
    const fileRef = FileRef.parse(file);
    const result = addFile([root, fileRef.ownerId, fileRef]);
    if (E.isLeft(result)) throw getError(result.left);

    const data = result.right[0].data;
    addFileRepo(data.folderId, data.file);

    return { success: true };
  }
}

const errors = {
  NotEnoughSpace: new BadRequestException('Not enough space'),
  NotPermitted: new ForbiddenException('Not permitted'),
} as const;

const getError = (error: keyof typeof errors) => errors[error];

const addFileRepo = (folderId: string, file: FileRef) => {
  console.log('addFileRepo', folderId, file);
};

const folder = FolderAgg.parse({
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'folder',
  size: 0,
  ownerId: '123e4567-e89b-12d3-a456-426614174000',
  parentId: null,
  contentType: 'application/vnd.folder',
  files: [],
  folderIds: [],
});

const root: StorageRoot = StorageRoot.parse({
  id: '73285bb0-8715-4810-8574-ade024ba51e8',
  totalSpace: 1000,
  usedSpace: 0,
  ref: folder,
});

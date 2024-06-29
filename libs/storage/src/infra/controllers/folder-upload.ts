import { Authenticated, useZodPipe } from '@app/auth';
import { FileRef, UUID } from '../../domain';
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RequestWithUser } from 'express';
import * as z from 'zod';
import { Transactional } from '@nestjs-cls/transactional';
import { StorageService } from '@app/storage/application';

const badReq = (msg: string) => new BadRequestException(msg);

@Controller('storage')
@UseGuards(Authenticated)
export class FolderUploadUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('folders/:id/upload-folder')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 6 }]))
  @Transactional()
  async execute(
    @Req() req: RequestWithUser,
    @Param('id', useZodPipe(UUID)) id: UUID,
    @Body() body: any,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    const user = req.user;
    const folder = await this.storageService.getFolder(id);
    if (!folder) throw badReq('Folder not found');
    if (folder.ownerId !== user.id) throw badReq('Not authorized');

    const files = upload.files;

    folder.files = [];
    folder.folders = [];

    type FolderTmp = {
      name: string;
      files: Express.Multer.File[];
      folders: Record<string, FolderTmp>;
    };

    const foldertmp: FolderTmp = { name: '', files: [], folders: {} };
    for (const file of files) {
      const path = file.originalname.split('/');
      const first = path.shift();
      if (!first || path.length === 0) {
        if (first) file.originalname = first;
        const fileRef = {
          ...file,
          id: file.filename, // UUID
          name: file.originalname,
          size: file.size,
          contentType: file.mimetype,
          ownerId: user.id,
        } as unknown as FileRef;
        folder.files.push(fileRef);
        continue;
      }
      foldertmp.name = first;
      let current = foldertmp;
      for (let i = 0; i < path.length - 1; i++) {
        const name = path[i];
        if (!current.folders[name])
          current.folders[name] = { name, files: [], folders: {} };
        current = current.folders[name];
      }
      file.originalname = path[path.length - 1];
      current.files.push(file);
    }

    folder.folders.push(foldertmp);
    return folder;
  }

  async validityCheck() {}
}

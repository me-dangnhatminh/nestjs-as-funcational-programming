import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

import { Authenticated, useZodPipe } from '@app/auth';

import { StorageService } from '../../application';
import { Accessor, FileRef, PastTime, Permissions } from '../../domain';
import * as z from 'zod';

export const UploadFilesDTO = z.object({
  fileMedata: z.record(
    z.object({
      pinnedAt: PastTime.nullable().default(null),
      createdAt: PastTime.default(new Date()),
      modifiedAt: PastTime.nullable().default(null),
      archivedAt: PastTime.nullable().default(null),
      description: z.string().nullable().default(null),
      thumbnail: z.string().nullable().default(null),
    }),
  ),
});
type UploadFilesDTO = z.infer<typeof UploadFilesDTO>;

@Controller('storage')
@UseGuards(Authenticated)
export class FileUploadUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('my')
  @UseInterceptors()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }])) // TOOD: Fix maxCount
  @Transactional()
  async execute(
    @Req() req,
    @Body(useZodPipe(UploadFilesDTO)) dto: UploadFilesDTO,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const user = Accessor.parse(req.user);
    const fileRefs = files.map((file) => {
      const fileRef = FileRef.parse({
        ...dto.fileMedata[file.filename],
        id: file.filename,
        name: file.originalname,
        size: file.size,
        contentType: file.mimetype,
        ownerId: user.id,
      });
      return fileRef;
    });

    // ----------------- Access control -----------------
    const resource = await this.storageService.getMyStorage(user.id);
    const valid = Permissions.isOwner(user, resource, fileRefs);
    if (!valid) throw new Error(`Access denied, can error in AuthGuard`);
    // --------------------------------------------------
    return await this.storageService.addFiles(valid);
  }
}
export default FileUploadUseCase;

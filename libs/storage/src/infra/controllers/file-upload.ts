import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { FileInterceptor } from '@nestjs/platform-express';

import { Authenticated, useZodPipe } from '@app/auth';

import { StorageService } from '../../application';
import { Accessor, FileRef, PastTime, Permissions } from '../../domain';
import * as z from 'zod';
import { UUID } from '@app/auth/domain';

export const UploadFileDTO = z.object({
  pinnedAt: PastTime.nullable().default(null),
  createdAt: PastTime.default(new Date()),
  modifiedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
  description: z.string().nullable().default(null),
  thumbnail: z.string().nullable().default(null),
});
export type UploadFileDTO = z.infer<typeof UploadFileDTO>;

@Controller('storage')
@UseGuards(Authenticated)
export class FileUploadUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('folders/:id')
  @UseInterceptors(FileInterceptor('file'))
  @Transactional()
  async execute(
    @Req() req,
    @Body(useZodPipe(UploadFileDTO)) dto: UploadFileDTO,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (id === 'my-storage') id = req.user.id;
    const folderId = UUID.parse(id);
    const user = Accessor.parse(req.user);
    const fileRef = FileRef.parse({
      ...dto,
      id: file.filename,
      name: file.originalname,
      size: file.size,
      contentType: file.mimetype,
      ownerId: user.id,
    });
    // ----------------- Access control -----------------
    const resource = await this.storageService.getFolder(folderId);
    if (!resource) throw new BadRequestException(`Folder not found`);
    const valid = Permissions.isOwner(user, resource, fileRef);
    if (!valid) throw new BadRequestException('Folder not found'); // TODO: dont use FobiddenException
    // --------------------------------------------------
    return await this.storageService.addFile(valid);
  }
}
export default FileUploadUseCase;

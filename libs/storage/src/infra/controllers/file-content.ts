import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { createReadStream } from 'fs-extra';
import * as z from 'zod';

import { Authenticated } from '@app/auth';

import { StorageService } from '../../application';
import { Accessor, PastTime, Permissions } from '../../domain';

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
export class FileContentUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Get('files/:id')
  @UseGuards(Authenticated)
  async execute(@Param('id') fileId: string, @Req() req) {
    const user = Accessor.parse(req.user);
    const resource = await this.storageService.getFileRef(fileId);
    // ----------------- Access control -----------------
    if (!resource) throw new BadRequestException("File doesn't exist");
    const valid = Permissions.isOwner(user, resource, null);
    if (!valid) throw new BadRequestException("File doesn't exist");
    // --------------------------------------------------

    const filePath = this.storageService.getContent(valid);
    if (!filePath) {
      await this.storageService.hardRemoveFile(valid); // side effect
      throw new BadRequestException("File doesn't exist");
    }

    // ----------------- Response -----------------
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream, {
      disposition: `attachment; filename="${resource.name}"`,
      type: resource.contentType,
      length: resource.size,
    });
  }
}
export default FileContentUseCase;

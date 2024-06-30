import { Authenticated, useZodPipe } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { StorageService } from '@app/storage/application';
import {
  Accessor,
  FolderInfo,
  PastTime,
  Permissions,
} from '@app/storage/domain';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import * as z from 'zod';
import { v4 as uuid } from 'uuid';

const CreateFolderDTO = z.object({
  name: z.string(),
  parentId: UUID.nullable().default(null),
  createdAt: PastTime.default(new Date()),
  pinnedAt: PastTime.nullable().default(null),
  modifiedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});
type CreateFolderDTO = z.infer<typeof CreateFolderDTO>;

@Controller('storage')
@UseGuards(Authenticated)
export class FolderCreateUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('folders')
  async excute(
    @Req() req,
    @Body(useZodPipe(CreateFolderDTO)) dto: CreateFolderDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = Accessor.parse(req.user);
    if (dto.parentId === null) dto.parentId = user.id;
    const folder = await this.storageService.getFolder(dto.parentId);
    if (!folder) throw new BadRequestException('Parent folder not found');
    const item = FolderInfo.parse({
      ...dto,
      id: uuid(),
      ownerId: user.id,
      size: 0,
    });
    const valid = Permissions.isOwner(user, folder, item);
    if (!valid) throw new BadRequestException('Access denied');
    const newItem = await this.storageService.addFolder(valid);
    res.setHeader('Location', `/storage/folders/${newItem.id}`);
  }
}
export default FolderCreateUseCase;

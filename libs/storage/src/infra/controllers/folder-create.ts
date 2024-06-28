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
import { RequestWithUser, Response } from 'express';
import * as z from 'zod';

const CreateFolderDTO = z.object({
  name: z.string(),
  parentId: UUID,
  createdAt: PastTime.default(new Date()),
  pinnedAt: PastTime.nullable().default(null),
  archivedAt: PastTime.nullable().default(null),
});
type CreateFolderDTO = z.infer<typeof CreateFolderDTO>;

@Controller('storage')
@UseGuards(Authenticated)
export class FolderCreateUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('folders')
  async excute(
    @Req() req: RequestWithUser,
    @Body(useZodPipe(CreateFolderDTO)) dto: CreateFolderDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const folder = await this.storageService.getFolder(dto.parentId);
    if (!folder) throw new BadRequestException('Parent folder not found');
    const user = Accessor.parse({ id: req.user.id });
    const item = FolderInfo.parse({ ...dto, ownerId: user.id, size: 0 });
    const valid = Permissions.isOwner(user, folder, item);
    if (!valid) throw new BadRequestException('Access denied');
    const newItem = await this.storageService.addFolder(valid);
    res.setHeader('Location', `/storage/folders/${newItem.id}`);
  }
}

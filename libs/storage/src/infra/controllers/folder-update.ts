import { Authenticated, useZodPipe } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { StorageService } from '@app/storage/application';
import { Accessor, FolderInfo } from '@app/storage/domain';
import { Transactional } from '@nestjs-cls/transactional';

import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as z from 'zod';

const Rename = z.object({ label: z.literal('rename'), name: z.string() });
const Archive = z.object({ label: z.literal('archive') });
const Pin = z.object({ label: z.literal('pin') });
const Unpin = z.object({ label: z.literal('unpin') });
const Unarchive = z.object({ label: z.literal('unarchive') });
const UpdateDTO = z.union([Rename, Archive, Pin, Unpin, Unarchive]);

type Rename = z.infer<typeof Rename>;
type Archive = z.infer<typeof Archive>;
type Pin = z.infer<typeof Pin>;
type Unpin = z.infer<typeof Unpin>;
type Unarchive = z.infer<typeof Unarchive>;
type UpdateDTO = z.infer<typeof UpdateDTO>;

type UpdateProps = Partial<{
  name: string;
  ownerId: UUID;
  pinnedAt: Date | null;
  archivedAt: Date | null;
}>;

const updateStrategy = (props: UpdateProps, folder: FolderInfo) => {
  const clone = structuredClone(folder);
  if (props.name !== undefined) clone.name = props.name;
  if (props.ownerId !== undefined) clone.ownerId = props.ownerId;
  if (props.pinnedAt !== undefined) clone.pinnedAt = props.pinnedAt;
  if (props.archivedAt !== undefined) clone.archivedAt = props.archivedAt;
  clone.modifiedAt = new Date();
  return Object.freeze(clone);
};
const badReq = (msg: string) => new BadRequestException(msg);
const update = (body: UpdateDTO, folder: FolderInfo) => {
  switch (body.label) {
    case 'rename':
      return updateStrategy({ name: body.name }, folder);
    case 'archive':
      if (folder.archivedAt) throw badReq('Folder already archived');
      return updateStrategy({ archivedAt: new Date() }, folder);
    case 'unarchive':
      if (!folder.archivedAt) throw badReq('Folder not archived');
      return updateStrategy({ archivedAt: null }, folder);
    case 'pin':
      if (folder.pinnedAt) throw badReq('Folder already pinned');
      return updateStrategy({ pinnedAt: new Date() }, folder);
    case 'unpin':
      if (!folder.pinnedAt) throw badReq('Folder not pinned');
      return updateStrategy({ pinnedAt: null }, folder);
    default:
      throw new Error('Invalid update label');
  }
};

@Controller('storage')
@UseGuards(Authenticated)
export class FolderUpdateUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Patch('folders/:id')
  @Transactional()
  async excute(
    @Req() req,
    @Body(useZodPipe(UpdateDTO)) body: UpdateDTO,
    @Param('id', useZodPipe(UUID)) id: UUID,
  ) {
    const user = Accessor.parse(req.user);
    const folder = await this.storageService.getFolder(id);
    if (!folder) throw new BadRequestException('Folder not found');
    if (!folder.rootId || !folder.parentId)
      throw new BadRequestException('Folder not found');
    if (folder.ownerId !== user.id)
      throw new BadRequestException('Folder not found');
    const updated = update(body, folder);

    // TODO: refactor this
    if (body.label == 'archive') {
      await this.storageService.softRemoveFolder(folder);
    } else if (body.label == 'unarchive') {
      await this.storageService.restoreFolder(folder);
    } else await this.storageService.updateFolder(updated);
  }
}
export default FolderUpdateUseCase;

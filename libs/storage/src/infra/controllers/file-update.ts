import { Authenticated, useZodPipe } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { StorageService } from '@app/storage/application';
import { FileRef } from '@app/storage/domain';
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
import { RequestWithUser } from 'express';
import * as z from 'zod';

const Rename = z.object({ label: z.literal('rename'), name: z.string() });
const Archive = z.object({ label: z.literal('archive') });
const Pin = z.object({ label: z.literal('pin') });
const Unpin = z.object({ label: z.literal('unpin') });
const Unarchive = z.object({ label: z.literal('unarchive') });

type Rename = z.infer<typeof Rename>;
type Archive = z.infer<typeof Archive>;
type Pin = z.infer<typeof Pin>;
type Unpin = z.infer<typeof Unpin>;
type Unarchive = z.infer<typeof Unarchive>;
type UpdateBody = Rename | Archive | Pin | Unpin | Unarchive;

type UpdateProps = Partial<{
  name: string;
  ownerId: UUID;
  pinnedAt: Date | null;
  archivedAt: Date | null;
}>;
const updateStrategy = (props: UpdateProps, file: FileRef) => {
  const clone = structuredClone(file);
  if (props.name !== undefined) clone.name = props.name;
  if (props.ownerId !== undefined) clone.ownerId = props.ownerId;
  if (props.pinnedAt !== undefined) clone.pinnedAt = props.pinnedAt;
  if (props.archivedAt !== undefined) clone.archivedAt = props.archivedAt;
  clone.modifiedAt = new Date();
  return Object.freeze(clone);
};

const badReq = (msg: string) => new BadRequestException(msg);
const update = (body: UpdateBody, file: FileRef) => {
  switch (body.label) {
    case 'rename':
      return updateStrategy({ name: body.name }, file);
    case 'archive':
      if (file.archivedAt) throw badReq('File already archived');
      return updateStrategy({ archivedAt: new Date() }, file);
    case 'unarchive':
      if (!file.archivedAt) throw badReq('File not archived');
      return updateStrategy({ archivedAt: null }, file);
    case 'pin':
      if (file.pinnedAt) throw badReq('File already pinned');
      return updateStrategy({ pinnedAt: new Date() }, file);
    case 'unpin':
      if (!file.pinnedAt) throw badReq('File not pinned');
      return updateStrategy({ pinnedAt: null }, file);
    default:
      throw new Error('Invalid update label');
  }
};

@Controller('storage')
@UseGuards(Authenticated)
export class FileUpdateUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Patch('files/:id')
  @Transactional()
  async excute(
    @Req() req: RequestWithUser,
    @Body(useZodPipe(z.union([Rename, Archive, Pin])))
    body: Rename | Archive | Pin,
    @Param('id', useZodPipe(UUID)) id: UUID,
  ) {
    const file = await this.storageService.getFileRef(id);
    if (!file) throw badReq('File not found');
    if (file.ownerId !== req.user.id) throw badReq('Unauthorized');
    const updated = update(body, file);
    await this.storageService.updateFile(updated);
  }
}
export default FileUpdateUseCase;

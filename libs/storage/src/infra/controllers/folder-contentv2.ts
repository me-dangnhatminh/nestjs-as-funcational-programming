import { Authenticated } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { Accessor } from '@app/storage/domain';
import { TransactionHost } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as ReadSide from '@prisma/client';
// import * as z from 'zod';

// const Lable = z.enum(['pinned', 'archived', 'default']);
// const Type = z.enum(['file', 'folder', 'all']);
// const SortOrder = z.enum(['asc', 'desc']);
// const SortField = z.enum([
//   'name',
//   'size',
//   'createdAt',
//   'modifiedAt',
//   'pinnedAt',
// ]);

// const OffsetPaginationDTO = z.object({
//   sort: SortField.default('name'),
//   order: SortOrder.default('asc'),
//   limit: z.number().int().min(10).max(100).default(10),
//   offset: z.number().int().min(0).default(0),
// });
// type OffsetPaginationDTO = z.infer<typeof OffsetPaginationDTO>;

type OffsetPaginationResult = {
  sort: string;
  order: string;
  limit: number;
  offset: number;
  total: number;
};

type FolderContentResult = ReadSide.Folder & {
  content: OffsetPaginationResult & {
    files: ReadSide.FileRef[];
    folders: ReadSide.Folder[];
  };
};

@Controller('storage')
@UseGuards(Authenticated)
export class FolderContentUseCase {
  constructor(private readonly txHost: TransactionHost) {}

  @Get(['', 'folders/:id'])
  async excute(
    @Req() req,
    @Param('id') id: string,
  ): Promise<FolderContentResult> {
    const user = Accessor.parse(req.user);
    const folderId = UUID.parse(id ?? user.id);
    const tx = this.txHost.tx as ReadSide.PrismaClient;

    const parent = await tx.folder.findUnique({
      where: { id: folderId, archivedAt: null, ownerId: req.user.id },
      include: { folders: { where: { archivedAt: null } } },
    });
    if (!parent) throw new BadRequestException('Folder not found');
    const files = await tx.fileInFolder.findMany({
      where: { folderId: parent.id, file: { archivedAt: null } },
      include: { file: true },
    });

    const total = parent.folders.length + files.length;

    const result: FolderContentResult = {
      ...parent,
      content: {
        sort: 'name',
        order: 'asc',
        limit: 10,
        offset: 0,
        total,
        files: files.map((f) => f.file),
        folders: parent.folders,
      },
    };
    return result;
  }
}

export default FolderContentUseCase;

import { Authenticated, useZodPipe } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as ReadSide from '@prisma/client';
import { RequestWithUser } from 'express';
import * as z from 'zod';

const Lable = z.enum(['recent', 'pinned', 'archived']);
const SortOrder = z.enum(['asc', 'desc']);
const SortField = z.enum([
  'name',
  'size',
  'createdAt',
  'modifiedAt',
  'pinnedAt',
]);

const OffsetPaginationDTO = z.object({
  label: Lable.default('recent'),
  sort: SortField.default('name'),
  order: SortOrder.default('asc'),
  limit: z.number().int().min(10).max(100).default(10),
  offset: z.number().int().min(0).default(0),
});
type OffsetPaginationDTO = z.infer<typeof OffsetPaginationDTO>;

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
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<FolderContentResult> {
    const folderId = UUID.parse(id ?? req.user.id);
    const tx = this.txHost.tx as ReadSide.PrismaClient;

    const parent = await tx.folder.findUnique({
      where: { id: folderId, archivedAt: null, ownerId: req.user.id },
      include: {
        folders: { where: { archivedAt: null } },
        files: { include: { file: true } },
      },
    });
    if (!parent) throw new BadRequestException('Folder not found');
    const total = parent.folders.length + parent.files.length;
    const result: FolderContentResult = {
      ...parent,
      content: {
        sort: 'name',
        order: 'asc',
        limit: 10,
        offset: 0,
        total,
        files: parent.files
          .filter((f) => !f.file.archivedAt)
          .map((f) => f.file),
        folders: parent.folders,
      },
    };
    return result;
  }
}

// async excute(
//   @Req() req: RequestWithUser,
//   @Param('id') id: string,
//   @Query(useZodPipe(OffsetPaginationDTO)) query: OffsetPaginationDTO,
// ): Promise<FolderContentResult> {
//   const folderId = UUID.parse(id ?? req.user.id);
//   const tx = this.txHost.tx as ReadSide.PrismaClient;

//   const parent = await tx.folder.findUnique({ where: { id: folderId } });
//   if (!parent) throw new BadRequestException('Folder not found');
//   if (parent.ownerId !== req.user.id)
//     throw new BadRequestException('Folder not found');

//   const foldersP = tx.folder.findMany({
//     where: {
//       parentId: folderId,
//       pinnedAt: query.label === 'pinned' ? { not: null } : null,
//       archivedAt: query.label === 'archived' ? { not: null } : null,
//     },
//     orderBy: { [query.sort]: query.order },
//     take: query.limit,
//     skip: query.offset,
//   });

//   const filesP = tx.fileInFolder
//     .findMany({
//       where: {
//         folderId: folderId,
//         file: {
//           archivedAt: query.label === 'archived' ? { not: null } : null,
//         },
//       },
//       include: { file: true },
//       orderBy: { file: { [query.sort]: query.order } },
//       take: query.limit,
//       skip: query.offset,
//     })
//     .then((f) => f.map((f) => f.file));

//   const totalFolderP = tx.folder.count({
//     where: {
//       parentId: folderId,
//       pinnedAt: query.label === 'pinned' ? { not: null } : null,
//       archivedAt: query.label === 'archived' ? { not: null } : null,
//     },
//   });

//   const totalFileP = tx.fileInFolder.count({
//     where: {
//       folderId: folderId,
//       file: { archivedAt: query.label === 'archived' ? { not: null } : null },
//     },
//   });
//   const [folders, files, totalFolder, totalFile] = await Promise.all([
//     foldersP,
//     filesP,
//     totalFolderP,
//     totalFileP,
//   ]);

//   const total = totalFolder + totalFile;
//   return {
//     ...parent,
//     content: {
//       sort: query.sort,
//       order: query.order,
//       limit: query.limit,
//       offset: query.offset,
//       total,
//       files,
//       folders,
//     },
//   };
// }
export default FolderContentUseCase;

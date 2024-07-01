import { Authenticated, useZodPipe } from '@app/auth';
import { Accessor, FileRef, Folder, Permissions, UUID } from '../../domain';
import {
  BadRequestException,
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
import { Transactional, TransactionHost } from '@nestjs-cls/transactional';
import { StorageService } from '@app/storage/application';
import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';

const badReq = (msg: string) => new BadRequestException(msg);

@Controller('storage')
@UseGuards(Authenticated)
export class FolderUploadUseCase {
  constructor(
    private readonly storageService: StorageService,
    private readonly txHost: TransactionHost,
  ) {}

  @Post('folders/:id/upload-folder')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files' }], { preservePath: true }),
  )
  @Transactional()
  async execute(
    @Req() req,
    @Param('id', useZodPipe(UUID)) id: UUID,
    @UploadedFiles(new ParseFilePipe({ fileIsRequired: true }))
    upload: { files: Express.Multer.File[] },
  ) {
    const user = Accessor.parse(req.user);
    const folder = await this.storageService.getFolder(id);
    if (!folder) throw badReq('Folder not found');
    const isOwner = Permissions.isOwner(user, folder, null);
    if (!isOwner) throw badReq('Permission denied');

    // =================== Express Multer =================== //
    const files = upload?.files ?? [];
    type FolderTmp = {
      files: Express.Multer.File[];
      folders: Record<string, FolderTmp>;
    };
    const folderEmpty = () => ({ files: [], folders: {} });
    const foldertmp: Record<string, FolderTmp> = {};
    for (const file of files) {
      const path = file.originalname.split('/');
      if (path.length < 2) throw `Invalid path, must be at least 2 levels`;
      let current = foldertmp;
      for (let i = 0; i < path.length - 1; i++) {
        const f = current[path[i]];
        if (!f) current[path[i]] = folderEmpty();
        if (i === path.length - 2) break;
        current = current[path[i]].folders;
      }
      file.originalname = path[path.length - 1];
      current[path[path.length - 2]].files.push(file);
    }

    // =================== Pure function =================== //

    const now = new Date();
    const buildFolder = (
      temp: Record<string, FolderTmp>,
      parent: Folder,
    ): Folder[] => {
      return Object.entries(temp).map(([folderName, folder], index) => {
        const files: FileRef[] = folder.files.map((file) => ({
          id: file.filename,
          name: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          createdAt: now,
          ownerId: user.id,
          archivedAt: null,
          modifiedAt: null,
          description: null,
          pinnedAt: null,
          thumbnail: null,
        }));

        const folderId = uuid();
        const newFolder: Folder = {
          id: folderId,
          name: folderName,
          ownerId: user.id,
          createdAt: now,
          archivedAt: null,
          modifiedAt: null,
          pinnedAt: null,
          size: 0,
          rootId: parent.rootId ?? parent.id,
          parentId: parent.id,
          depth: 0,
          lft: 0,
          rgt: 0,
          files,
        };
        newFolder.folders = buildFolder(folder.folders, newFolder);
        return newFolder;
      });
    };

    const newFolders = buildFolder(foldertmp, folder);
    folder.folders = newFolders;

    const calculateLftRgt = (folder: Folder): number => {
      const children = folder.folders ?? [];
      if (children.length === 0) return folder.rgt;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        child.depth = folder.depth + 1;
        child.parentId = folder.id;
        child.rootId = folder.rootId ?? folder.id;

        child.lft = folder.rgt;
        child.rgt = folder.rgt + 1;
        child.rgt = calculateLftRgt(child);
        folder.rgt = child.rgt + 1;
      }
      return folder.rgt;
    };

    const preRgt = folder.rgt;
    calculateLftRgt(folder);
    const diff = folder.rgt - preRgt;
    // =================== Prisma =================== //
    const tx = this.txHost.tx as PrismaClient;

    const flatFolder = (folder: Folder[]): Folder[] => {
      return folder.reduce<Folder[]>((acc, f) => {
        acc.push(f);
        if (f.folders) acc.push(...flatFolder(f.folders));
        return acc;
      }, []);
    };

    const flatFile = (folder: Folder[]): (FileRef & { folderId: string })[] => {
      return folder.reduce<(FileRef & { folderId: string })[]>((acc, f) => {
        if (f.files)
          acc.push(...f.files.map((file) => ({ ...file, folderId: f.id })));
        if (f.folders) acc.push(...flatFile(f.folders));
        return acc;
      }, []);
    };

    // extend root
    const rootId = folder.rootId ?? folder.id;
    await tx.folder.update({
      where: {
        id: rootId,
        rootId: null,
        parentId: null,
        lft: 0,
        depth: 0,
      },
      data: { rgt: { increment: diff } },
    });

    // extend right siblings
    const isRoot = folder.rootId === folder.id;
    if (!isRoot) {
      await tx.folder.updateMany({
        where: { rootId, rgt: { gte: folder.rgt } },
        data: { rgt: { increment: diff } },
      });
      await tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: diff } },
      });
    }

    const _folders = flatFolder(newFolders);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const persitFolders = _folders.map(({ folders, files, ...f }) => f);
    await tx.folder.createMany({ data: persitFolders });

    const _files = flatFile(newFolders);
    await tx.fileRef.createMany({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      data: _files.map(({ folderId, ...f }) => f),
    });
    await tx.fileInFolder.createMany({
      data: _files.map((f) => ({ folderId: f.folderId, fileId: f.id })),
    });
    return newFolders;
  }

  // async validityCheck() {}
}

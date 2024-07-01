import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Authenticated } from '@app/auth';

import { Accessor } from '../../domain';
import { TransactionHost } from '@nestjs-cls/transactional';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as JSZip from 'jszip';
import { Response } from 'express';

@Controller('storage')
export class FolderDownloadUseCase {
  constructor(private readonly txHost: TransactionHost) {}

  @Get('folders/:id/download')
  @UseGuards(Authenticated)
  async execute(
    @Req() req,
    @Param('id') folderId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = Accessor.parse(req.user);
    const tx = this.txHost.tx as PrismaClient;
    const folder = await tx.folder.findUnique({ where: { id: folderId } });
    if (!folder) throw new BadRequestException('Folder not found');
    if (folder.ownerId !== user.id)
      throw new BadRequestException('Folder not found');

    const rootId = folder.rootId ?? folder.id;
    const child = await tx.folder.findMany({
      where: {
        rootId: rootId,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        depth: true,
        parentId: true,
        files: {
          select: {
            file: { select: { id: true, name: true, contentType: true } },
          },
        },
      },
      orderBy: { depth: 'asc' }, // Required for pathTree
    });

    // =========================== Calculate pathTree ===========================
    type PathTree = Record<string, string>; // [id, path]
    const pathTree: PathTree = {};
    const pathUsed: Record<string, boolean> = {}; // [path, used]
    type FileSM = { id: string; name: string; contentType: string };
    type FileTree = Record<string, FileSM>;
    const fileTree: FileTree = {}; // for file

    child.forEach((f) => {
      const parentId = f.parentId ?? f.id;
      const pathParent = pathTree[parentId] ?? '';
      let name = f.name === '' ? 'Untitled' : f.name;
      for (let i = 0; pathUsed[`${pathParent}/${name}`]; i++) {
        name = `${f.name}(${i})`;
      }
      pathUsed[`${pathParent}/${name}`] = true;
      pathTree[f.id] = `${pathParent}/${name}`.replace(/^\//, ''); // remove leading slash

      f.files.forEach((ff) => {
        let filename = ff.file.name === '' ? 'Untitled' : ff.file.name;
        for (let i = 0; fileTree[`${pathTree[f.id]}/${filename}`]; i++) {
          filename = `${ff.file.name}(${i})`;
        }
        const _ = `${pathTree[f.id]}/${filename}`.replace(/^\//, ''); // remove leading slash
        fileTree[_] = ff.file;
      });
    });

    // =========================== Create zip ===========================
    const ROOT_FOLDER = 'D:/uploads'; // TODO: move to config
    const TEMP_FOLDER = `${ROOT_FOLDER}/tmps`;
    fs.ensureDirSync(TEMP_FOLDER);

    const rootName = folder.name === '' ? 'Untitled' : folder.name;
    const zip = new JSZip();

    Object.values(pathTree).forEach((foldername) =>
      zip.file(foldername, null, { dir: true }),
    );
    Object.entries(fileTree).forEach(([filepath, file]) => {
      const diskPath = path.resolve(ROOT_FOLDER, file.id);
      zip.file(filepath, fs.readFileSync(diskPath));
    });

    const resName = `${rootName}-${Date.now()}.zip`;
    const tmpPath = path.resolve(TEMP_FOLDER, resName);
    await zip.generateAsync({ type: 'nodebuffer' }).then((content) => {
      fs.writeFileSync(tmpPath, content);
    });

    const stream = fs.createReadStream(tmpPath, {
      highWaterMark: 1024 * 1024,
    });

    res.setHeader('Content-Disposition', `attachment; filename=${resName}`);
    res.setHeader('Content-Type', 'application/zip');
    return new StreamableFile(stream);
  }
}
export default FolderDownloadUseCase;

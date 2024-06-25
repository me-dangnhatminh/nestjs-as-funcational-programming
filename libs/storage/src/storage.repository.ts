/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Folder, PrismaClient } from '@prisma/client';

@Injectable()
export class StorageRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  getFolderById(id: string) {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.findUniqueOrThrow({ where: { id } });
  }

  createRoot(ownerId: string, type: 'my-storage') {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.create({
      data: {
        id: ownerId,
        name: type,
        ownerId: ownerId,
        size: '0',
        createdAt: new Date(),
        archivedAt: null,
        rootId: null,
        depth: 0,
        lft: 0,
        rgt: 1,
      },
    });
  }

  async addToRoot(item: Omit<Folder, 'lft' | 'rgt' | 'depth'>, folder: Folder) {
    if (folder.rootId !== null) throw new Error('Not a root folder');
    const tx = this.txHost.tx as PrismaClient;
    const depth = 1;
    const rootId = folder.id;
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { increment: 2 } },
      select: { id: true, rgt: true },
    });

    const lft = folder.rgt;
    const rgt = folder.rgt + 1;
    const data: Folder = Object.assign({}, item, { lft, rgt, depth, rootId });
    return await tx.folder.create({ data });
  }

  async _addToFolder(
    item: Omit<Folder, 'lft' | 'rgt' | 'depth'>,
    folder: Folder,
  ) {
    if (folder.rootId === null) throw new Error('Not a folder');
    const tx = this.txHost.tx as PrismaClient;
    const rootId = folder.rootId;

    // update root
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { increment: 2 } },
      select: { id: true, rgt: true },
    });

    // update current folder
    await tx.folder.update({
      where: { id: folder.id, rootId },
      data: { rgt: { increment: 2 } },
    });

    // update right
    await tx.folder.updateMany({
      where: { rootId, rgt: { gt: folder.rgt } },
      data: { lft: { increment: 2 }, rgt: { increment: 2 } },
    });

    const depth = folder.depth + 1;
    const lft = folder.rgt;
    const rgt = folder.rgt + 1;
    const data: Folder = Object.assign({}, item, { lft, rgt, depth, rootId });
    return await tx.folder.create({ data });
  }

  addFolder(item: Omit<Folder, 'lft' | 'rgt' | 'depth'>, folder: Folder) {
    if (folder.rootId === null) return this.addToRoot(item, folder);
    return this._addToFolder(item, folder);
  }

  async addToFolder(
    item: Omit<Folder, 'lft' | 'rgt' | 'depth'>,
    folder: Folder,
  ) {
    const tx = this.txHost.tx as PrismaClient;

    const isRoot = folder.rootId === folder.id;
    const rootId = folder.rootId ?? folder.id;

    // extend root
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { increment: 2 } },
    });

    if (!isRoot) {
      await tx.folder.updateMany({
        where: { rootId, rgt: { gt: folder.rgt } },
        data: { rgt: { increment: 2 } },
      });
      await tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: 2 } },
      });
    }

    const lft = folder.rgt;
    const rgt = folder.rgt + 1;
    const depth = folder.depth + 1;
    const data: Folder = Object.assign({}, item, { lft, rgt, depth, rootId });
    return await tx.folder.create({ data });
  }
}

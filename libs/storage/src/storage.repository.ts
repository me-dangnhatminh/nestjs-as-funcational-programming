/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { Folder, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class StorageRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}
  async createRoot(ownerId: string, type: 'my-storage') {
    if (type !== 'my-storage') throw new Error('Invalid type');
    const tx = this.txHost.tx as PrismaClient;
    return await tx.folder.create({
      data: {
        id: ownerId,
        name: type,
        size: '0',
        ownerId: ownerId,
        rootId: null,
        createdAt: new Date(),
        archivedAt: null,
        depth: 0,
        lft: 0,
        rgt: 1,
      },
    });
  }

  async addFolder(item: Folder & { rootId: string }) {
    const tx = this.txHost.tx as PrismaClient;
    const parent = await tx.folder.findFirst({
      where: {
        depth: item.depth - 1,
        lft: { lte: item.lft },
        rgt: { gte: item.rgt },
      },
    });
    if (!parent) throw new Error('Parent not found');

    const root = await tx.folder.update({
      where: { id: item.rootId, rootId: null, depth: 0, lft: 0 },
      data: { rgt: { increment: 2 } },
      select: { rgt: true },
    });

    // update inside
    await tx.folder.updateMany({
      where: { lft: { gte: root.rgt } },
      data: { lft: { increment: 2 }, rgt: { increment: 2 } },
    });

    // update right side
    await tx.folder.updateMany({
      where: { rootId: item.rootId, lft: { gte: root.rgt } },
      data: { rgt: { increment: 2 }, lft: { increment: 2 } },
    });

    // insert
    item.lft = root.rgt - 2;
    item.rgt = root.rgt - 1;
    const newFolder = await tx.folder.create({ data: item });
    return newFolder;
  }
}

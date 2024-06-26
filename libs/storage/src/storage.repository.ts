import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Folder, PrismaClient } from '@prisma/client';

// implement mapper

const createRoot = (ownerId: string, type: 'my-storage'): Folder =>
  Object.freeze({
    id: ownerId,
    name: type,
    size: BigInt(0),
    createdAt: new Date(),
    modifiedAt: null,
    archivedAt: null,
    // -- custom metadata
    ownerId: ownerId,
    pinnedAt: null,
    // -- hierarchy
    rootId: null,
    parentId: null,
    depth: 0,
    lft: 0,
    rgt: 1,
  });

type InsertFolder = Omit<Folder, 'lft' | 'rgt' | 'depth' | 'parentId'>;
@Injectable()
export class StorageRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}
  // =============== READ SIDE =============== //
  async getFolder(id: string) {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.findUnique({ where: { id } });
  }

  async getContent(folder: Folder, depth: number) {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.findMany({
      where: {
        rootId: folder.rootId,
        lft: { gt: folder.lft },
        rgt: { lt: folder.rgt },
        depth: { lte: folder.depth + depth },
      },
    });
  }

  // =============== WRITE SIDE =============== //
  async upsertRoot(ownerId: string, type: 'my-storage' = 'my-storage') {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.upsert({
      where: { id: ownerId },
      create: createRoot(ownerId, type),
      update: {},
    });
  }

  async createRoot(ownerId: string, type: 'my-storage') {
    const tx = this.txHost.tx as PrismaClient;
    const root = createRoot(ownerId, type);
    return tx.folder.create({ data: root });
  }

  async addFolder(item: InsertFolder, folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;
    // extend root
    const rootId = folder.rootId ?? folder.id;
    await tx.folder.update({
      where: {
        id: rootId,
        rootId: { equals: null },
        parentId: { equals: null },
        lft: 0,
        depth: 0,
      },
      data: { rgt: { increment: 2 } },
    });

    // extend right siblings
    const notRoot = folder.rootId !== folder.id;
    if (notRoot) {
      await tx.folder.updateMany({
        where: { rootId, rgt: { gt: folder.rgt } },
        data: { rgt: { increment: 2 } },
      });
      await tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: 2 } },
      });
    }

    // -- insert new folder
    const data: Folder = Object.assign({}, item, {
      rootId: rootId,
      parentId: folder.id,
      lft: folder.rgt,
      rgt: folder.rgt + 1,
      depth: folder.depth + 1,
      archivedAt: folder.archivedAt,
    });
    return tx.folder.create({ data });
  }

  async softDelete(folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;
    const archivedAt = new Date();
    return tx.folder.updateMany({
      where: {
        rootId: folder.rootId,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
      },
      data: { archivedAt },
    });
  }

  async restore(folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;
    return tx.folder.updateMany({
      where: {
        rootId: folder.rootId,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
      },
      data: { archivedAt: null },
    });
  }

  async hardDelete(folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;
    const removed = tx.folder.delete({ where: folder });

    const rootId = folder.rootId ?? folder.id;
    const diff = folder.rgt - folder.lft + 1;

    // extend root
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { decrement: diff } },
    });

    // extend parent
    const notRoot = folder.rootId !== folder.id;
    if (notRoot) {
      tx.folder.updateMany({
        where: { rootId, rgt: { gt: folder.rgt } },
        data: { rgt: { decrement: diff } },
      });

      tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { decrement: diff } },
      });
    }

    return removed;
  }
}

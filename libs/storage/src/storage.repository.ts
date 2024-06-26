import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Folder, PrismaClient } from '@prisma/client';

// implement mapper

const createRoot = (ownerId: string, type: 'my-storage') =>
  Object.freeze({
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
  });

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
  async upsertRoot(ownerId: string, type: 'my-storage') {
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

  async addFolder(item: Omit<Folder, 'lft' | 'rgt' | 'depth'>, folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;

    const isRoot = folder.rootId === folder.id;
    const rootId = folder.rootId ?? folder.id;
    // extend root
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { increment: 2 } },
    });

    // extend parent
    if (!isRoot) {
      tx.folder.updateMany({
        where: { rootId, rgt: { gt: folder.rgt } },
        data: { rgt: { increment: 2 } },
      });

      tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: 2 } },
      });
    }

    const lft = folder.rgt;
    const rgt = folder.rgt + 1;
    const depth = folder.depth + 1;
    const data: Folder = Object.assign({}, item, { lft, rgt, depth, rootId });
    return tx.folder.create({ data });
  }

  async softDeleteDep(folder: Folder) {
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

  async restoreDep(folder: Folder) {
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

  async hardDeleteDep(folder: Folder) {
    const tx = this.txHost.tx as PrismaClient;
    const removed = await tx.folder.deleteMany({
      where: {
        rootId: folder.rootId,
        lft: { gte: folder.lft },
        rgt: { lte: folder.rgt },
      },
    });

    const isRoot = folder.rootId === folder.id;
    const rootId = folder.rootId ?? folder.id;
    const diff = folder.rgt - folder.lft + 1;

    // extend root
    await tx.folder.update({
      where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
      data: { rgt: { decrement: diff } },
    });

    // extend parent
    if (!isRoot) {
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

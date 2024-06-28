import { Injectable, Provider } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import * as Orm from '@prisma/client';
import * as Domain from '@app/storage';

import { createRoot, FileMapper, FolderMapper } from '../mappers';

type InsertFolder = Omit<Orm.Folder, 'lft' | 'rgt' | 'depth'>;
@Injectable()
export class StorageRepository implements Domain.IStorageRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<Orm.PrismaClient>
    >,
  ) {}

  addFolder(item: Domain.Folder, parent: Domain.Folder): Promise<void> {
    throw new Error('Method not implemented.');
  }

  // async getFolderLazy(id: string): Promise<Domain.Folder | null> {
  //   if (!id) return null;
  //   const tx = this.txHost.tx as Orm.PrismaClient;
  //   const folder = await tx.folder.findUnique({ where: { id } });
  //   if (!folder) return null;
  //   const folderDomain = FolderMapper.toDomain(folder);
  //   return this.createLazyLoadingProxy(folderDomain, id);
  // }

  // =============== Write Side =============== //
  getFileRef(id: string): Promise<Domain.FileRef | null> {
    const tx = this.txHost.tx as Orm.PrismaClient;
    return tx.fileRef
      .findUnique({ where: { id } })
      .then((f) => f && FileMapper.toDomain(f));
  }

  // =============== Read Side =============== //
  getFolder(id: string) {
    const tx = this.txHost.tx as Orm.PrismaClient;
    return tx.folder
      .findUnique({ where: { id } })
      .then((f) => (f ? FolderMapper.toDomain(f) : null));
  }

  // =============== Write Side =============== //
  addFile(item: Domain.FileRef, folder: Domain.Folder) {
    const tx = this.txHost.tx as Orm.PrismaClient;
    const orm = FileMapper.toOrm(item);
    const add = tx.fileRef.create({ data: orm });
    const update = tx.fileInFolder.create({
      data: { folderId: folder.id, fileId: orm.id },
    });
    return Promise.all([add, update]).then(() => {});
  }

  addFiles(items: Domain.FileRef[], folder: Domain.Folder) {
    const tx = this.txHost.tx as Orm.PrismaClient;
    const orm = items.map(FileMapper.toOrm);
    const add = tx.fileRef.createMany({ data: orm });
    const update = tx.fileInFolder.createMany({
      data: orm.map((item) => ({ folderId: folder.id, fileId: item.id })),
    });
    return Promise.all([add, update]).then(() => {});
  }

  hardRemoveFile(item: Domain.FileRef): Promise<void> {
    const tx = this.txHost.tx as Orm.PrismaClient;
    const remove = tx.fileRef.delete({ where: { id: item.id } });
    const removeInFolder = tx.fileInFolder.deleteMany({
      where: { fileId: item.id },
    });
    return Promise.all([remove, removeInFolder]).then(() => {});
  }

  // // =============== READ SIDE =============== //
  // getFolder(id: string) {
  //   const tx = this.txHost.tx as PrismaClient;
  //   return tx.folder.findUnique({ where: { id } });
  // }

  // getContent(folder: Folder, depth: number) {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const rootId = folder.rootId ?? folder.id;
  //   return tx.folder.findMany({
  //     where: {
  //       rootId: rootId,
  //       lft: { gt: folder.lft },
  //       rgt: { lt: folder.rgt },
  //       depth: { lte: folder.depth + depth },
  //     },
  //   });
  // }

  // // =============== WRITE SIDE =============== //
  // addFile(item: FileRef, folder: Folder): Promise<FileRef> {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const add = tx.fileRef.create({ data: item });
  //   const update = tx.fileInFolder.create({
  //     data: { folderId: folder.id, fileId: item.id },
  //   });
  //   return Promise.all([add, update]).then(() => item);
  // }

  // addFiles(items: FileRef[], folder: Folder): Promise<FileRef[]> {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const add = tx.fileRef.createMany({ data: items });
  //   const update = tx.fileInFolder.createMany({
  //     data: items.map((item) => ({ folderId: folder.id, fileId: item.id })),
  //   });
  //   return Promise.all([add, update]).then(() => items);
  // }

  upsertRoot(ownerId: string, type: 'my-storage' = 'my-storage') {
    const tx = this.txHost.tx as Orm.PrismaClient;
    return tx.folder
      .upsert({
        where: { id: ownerId },
        create: createRoot(ownerId, type),
        update: {},
      })
      .then(FolderMapper.toDomain);
  }

  // createRoot(ownerId: string, type: 'my-storage') {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const root = FolderFactory.createRoot(ownerId, type);
  //   return tx.folder.create({ data: root });
  // }

  _addFolder(item: InsertFolder, folder: Orm.Folder) {
    const tx = this.txHost.tx as Orm.PrismaClient;
    const tasks: Promise<unknown>[] = [];

    // extend root
    const rootId = folder.rootId ?? folder.id;
    const eRoot = tx.folder.update({
      where: {
        id: rootId,
        rootId: { equals: null },
        parentId: { equals: null },
        lft: 0,
        depth: 0,
      },
      data: { rgt: { increment: 2 } },
    });
    tasks.push(eRoot);

    // extend right siblings
    const isRoot = folder.rootId === folder.id;
    if (!isRoot) {
      const eRgt = tx.folder.updateMany({
        where: { rootId, rgt: { gte: folder.rgt } },
        data: { rgt: { increment: 2 } },
      });
      const eFRgt = tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: 2 } },
      });
      tasks.push(eRgt, eFRgt);
    }

    // -- insert new folder
    const data: Orm.Folder = Object.assign({}, item, {
      rootId: rootId,
      parentId: folder.id,
      lft: folder.rgt,
      rgt: folder.rgt + 1,
      depth: folder.depth + 1,
      archivedAt: folder.archivedAt,
    });
    const insert = tx.folder.create({ data });
    tasks.push(insert);
    return Promise.all(tasks).then(() => data);
  }

  addFolders(items: InsertFolder[], folder: Orm.Folder) {
    const tx = this.txHost.tx as Orm.PrismaClient;
    const tasks: Promise<unknown>[] = [];
    // extend root
    const rootId = folder.rootId ?? folder.id;
    const diff = items.length * 2;
    const extendRoot = tx.folder.update({
      where: {
        id: rootId,
        rootId: { equals: null },
        parentId: { equals: null },
        lft: 0,
        depth: 0,
      },
      data: { rgt: { increment: diff } },
    });
    tasks.push(extendRoot);

    // extend right siblings
    const isRoot = folder.rootId === folder.id;
    if (!isRoot) {
      const extenRight = tx.folder.updateMany({
        where: { rootId, rgt: { gte: folder.rgt } },
        data: { rgt: { increment: diff } },
      });
      const extendLeft = tx.folder.updateMany({
        where: { rootId, lft: { gt: folder.rgt } },
        data: { lft: { increment: diff } },
      });
      tasks.push(extenRight, extendLeft);
    }

    // -- insert new folders
    const data = items.map((item, i) =>
      Object.assign({}, item, {
        rootId: rootId,
        parentId: folder.id,
        lft: folder.rgt + i * 2,
        rgt: folder.rgt + i * 2 + 1,
        depth: folder.depth + 1,
        archivedAt: folder.archivedAt,
      }),
    );
    const inserts = tx.folder.createMany({ data });
    tasks.push(inserts);
    return Promise.all(tasks).then(() => data);
  }

  // async softDelete(folder: Folder) {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const archivedAt = new Date();
  //   return tx.folder.updateMany({
  //     where: {
  //       rootId: folder.rootId,
  //       lft: { gte: folder.lft },
  //       rgt: { lte: folder.rgt },
  //     },
  //     data: { archivedAt },
  //   });
  // }

  // async restore(folder: Folder) {
  //   const tx = this.txHost.tx as PrismaClient;
  //   return tx.folder.updateMany({
  //     where: {
  //       rootId: folder.rootId,
  //       lft: { gte: folder.lft },
  //       rgt: { lte: folder.rgt },
  //     },
  //     data: { archivedAt: null },
  //   });
  // }

  // async hardDelete(folder: Folder) {
  //   const tx = this.txHost.tx as PrismaClient;
  //   const removed = tx.folder.delete({ where: folder });

  //   const rootId = folder.rootId ?? folder.id;
  //   const diff = folder.rgt - folder.lft + 1;

  //   // extend root
  //   await tx.folder.update({
  //     where: { id: rootId, rootId: { equals: null }, lft: 0, depth: 0 },
  //     data: { rgt: { decrement: diff } },
  //   });

  //   // extend parent
  //   const notRoot = folder.rootId !== folder.id;
  //   if (notRoot) {
  //     tx.folder.updateMany({
  //       where: { rootId, rgt: { gt: folder.rgt } },
  //       data: { rgt: { decrement: diff } },
  //     });

  //     tx.folder.updateMany({
  //       where: { rootId, lft: { gt: folder.rgt } },
  //       data: { lft: { decrement: diff } },
  //     });
  //   }

  //   return removed;
  // }
}

export const storageRepository: Provider = {
  provide: Domain.IStorageRepository,
  useClass: StorageRepository,
};
export default StorageRepository;

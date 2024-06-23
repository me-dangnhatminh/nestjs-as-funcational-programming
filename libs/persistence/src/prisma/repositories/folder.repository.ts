/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransactionHost } from '@nestjs-cls/transactional';
import {
  PrismaTransactionalClient,
  TransactionalAdapterPrisma,
} from '@nestjs-cls/transactional-adapter-prisma';
import { Folder } from '@prisma/client';

export class NestedSetFolderRepository {
  private static readonly tableName = 'nested_set_folder';
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  private get tx() {
    return this.txHost.tx as PrismaTransactionalClient;
  }
}

export class FolderRepository {
  private static readonly tableName = 'folder';
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}

  private get tx() {
    return this.txHost.tx as PrismaTransactionalClient;
  }

  async addFolder(
    data: Folder,
    options: {
      depth: number;
      left: number;
      right: number;
    },
  ) {
    const folder = await this.tx.folder.create({ data });
    const folderNested = await this.tx.nestedSetFolder.create({
      data: {
        id: '1',
        folderId: folder.id,
        depth: options.depth,
        left: options.left,
        right: options.right,
      },
    });

    return folder;
    // folderNested will error because folderId not exist, how to fix this?, how to choice transactional level?
  }
}

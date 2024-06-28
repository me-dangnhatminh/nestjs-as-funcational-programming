import * as Orm from '@prisma/client';
import * as Domain from '@app/storage';

import { v4 as uuid } from 'uuid';

export const createRoot = (
  ownerId: string,
  name: string = 'my-storage',
): Orm.Folder =>
  Object.freeze({
    id: ownerId,
    ownerId: ownerId,
    name: name,
    size: BigInt(0),
    createdAt: new Date(),
    pinnedAt: null,
    modifiedAt: null,
    archivedAt: null,
    rootId: null,
    parentId: null,
    depth: 0,
    lft: 0,
    rgt: 1,
  });

export const createFolder = (
  ownerId: string,
  name: string,
  parentId: string,
  id: string = uuid(),
  pinnedAt: Date | null = null,
  createdAt: Date = new Date(),
  archivedAt: Date | null = null,
  modifiedAt: Date | null = null,
): Omit<Orm.Folder, 'depth' | 'lft' | 'rgt' | 'rootId'> =>
  Object.freeze({
    id,
    name,
    size: BigInt(0),
    createdAt,
    modifiedAt,
    archivedAt,
    ownerId,
    pinnedAt,
    parentId,
  });

export const FileMapper = {
  toDomain: (file: Orm.FileRef): Domain.FileRef =>
    Domain.FileRef.parse(Object.assign(file, { size: Number(file.size) })),
  toOrm: (file: Domain.FileRef): Orm.FileRef =>
    Object.freeze({
      id: file.id,
      name: file.name,
      size: BigInt(file.size),
      createdAt: file.createdAt,
      pinnedAt: file.pinnedAt,
      modifiedAt: file.modifiedAt,
      archivedAt: file.archivedAt,
      ownerId: file.ownerId,
      contentType: file.contentType,
      thumbnail: file.thumbnail,
      description: file.description,
    }),
};

export const FolderMapper = {
  toDomain: (orm: Orm.Folder): Domain.Folder =>
    Domain.Folder.parse({ ...orm, size: Number(orm.size) }),
  toOrm: (domain: Domain.Folder): Orm.Folder =>
    Object.freeze({
      id: domain.id,
      size: BigInt(domain.size),
      name: domain.name,
      archivedAt: domain.archivedAt,
      ownerId: domain.ownerId,
      createdAt: domain.createdAt,
      modifiedAt: domain.modifiedAt,
      pinnedAt: domain.pinnedAt,
      // -- different
      rootId: domain.rootId,
      parentId: domain.parentId,
      lft: domain.lft,
      rgt: domain.rgt,
      depth: domain.depth,
    }),
};

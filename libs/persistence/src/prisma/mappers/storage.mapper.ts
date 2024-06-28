import * as Orm from '@prisma/client';
import * as Domain from '@app/storage';

export const FileMapper = {
  toDomain: (file: Orm.FileRef): Domain.FileRef => Domain.FileRef.parse(file),
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
  toDomain: (orm: Orm.Folder): Domain.Folder => Domain.Folder.parse(orm),
  toOrm: (
    domain: Domain.Folder,
    extra: {
      createdAt: Date;
      modifiedAt: Date | null;
      parentId: string | null;
      rootId: string;
      lft: number;
      rgt: number;
      depth: number;
    },
  ): Orm.Folder =>
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
      rootId: extra.rootId,
      parentId: extra.parentId,
      lft: extra.lft,
      rgt: extra.rgt,
      depth: extra.depth,
    }),
};

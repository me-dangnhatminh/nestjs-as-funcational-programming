import { Folder } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const createRoot = (ownerId: string, name: string = 'my-storage'): Folder =>
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

const createFolder = (
  ownerId: string,
  name: string,
  parentId: string,
  id: string = uuid(),
  pinnedAt: Date | null = null,
  createdAt: Date = new Date(),
  archivedAt: Date | null = null,
  modifiedAt: Date | null = null,
): Omit<Folder, 'depth' | 'lft' | 'rgt' | 'rootId'> =>
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

export const FolderFactory = {
  createRoot,
  createFolder,
} as const;

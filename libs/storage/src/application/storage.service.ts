import { Injectable } from '@nestjs/common';
import {
  Admin,
  FileRef,
  Folder,
  FolderInfo,
  IDiskStorage,
  IStorageRepository,
  Owner,
  PermissionWrapper,
} from '../domain';

export type HardRemoveFileCmd = PermissionWrapper<Owner | Admin, FileRef, null>;
export type AddFileCmd = PermissionWrapper<Owner | Admin, Folder, FileRef>;
export type AddFilesCmd = PermissionWrapper<Owner | Admin, Folder, FileRef[]>;

export type GetFilePathQ = PermissionWrapper<Owner | Admin, FileRef, null>;
export type GetFolderContentQ = PermissionWrapper<
  Owner | Admin,
  FolderInfo,
  { depth: number; isFlat: boolean }
>;

@Injectable()
export class StorageService {
  constructor(
    private readonly diskStorage: IDiskStorage,
    private readonly storageRepo: IStorageRepository,
  ) {}

  getFilePath(q: GetFilePathQ) {
    return this.diskStorage.getPath(q.resource);
  }

  getFileRef(id: string) {
    return this.storageRepo.getFileRef(id);
  }

  getMyStorage(userId: string) {
    return this.storageRepo.upsertRoot(userId);
  }

  getFolder(id: string) {
    return this.storageRepo.getFolder(id);
  }

  addFile(cmd: AddFileCmd) {
    return this.storageRepo.addFile(cmd.meta, cmd.resource);
  }

  addFiles(cmd: AddFilesCmd) {
    return this.storageRepo.addFiles(cmd.meta, cmd.resource);
  }

  hardRemoveFile(cmd: HardRemoveFileCmd) {
    return this.storageRepo.hardRemoveFile(cmd.resource);
  }
}

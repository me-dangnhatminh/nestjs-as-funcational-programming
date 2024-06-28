import { Injectable } from '@nestjs/common';
import {
  Admin,
  FileRef,
  Folder,
  IDiskStorage,
  IStorageRepository,
  Owner,
  PermissionWrapper,
} from '../domain';

type HardRemoveFileCmd = PermissionWrapper<Owner | Admin, FileRef, null>;
type AddFileCmd = PermissionWrapper<Owner | Admin, Folder, FileRef>;
type AddFilesCmd = PermissionWrapper<Owner | Admin, Folder, FileRef[]>;

type GetFileContentQ = PermissionWrapper<Owner | Admin, FileRef, null>;

@Injectable()
export class StorageService {
  constructor(
    private readonly diskStorage: IDiskStorage,
    private readonly storageRepo: IStorageRepository,
  ) {}

  getContent(query: GetFileContentQ) {
    const file = query.resource;
    return this.diskStorage.getPath(file);
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

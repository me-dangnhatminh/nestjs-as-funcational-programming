import { Injectable } from '@nestjs/common';
import {
  Admin,
  FileRef,
  Folder,
  IStorageRepository,
  Owner,
  PermissionWrapper,
} from '../domain';

type AddFileCmd = PermissionWrapper<Owner | Admin, Folder, FileRef>;
type AddFilesCmd = PermissionWrapper<Owner | Admin, Folder, FileRef[]>;

@Injectable()
export class StorageService {
  constructor(private readonly storageRepo: IStorageRepository) {}

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
}

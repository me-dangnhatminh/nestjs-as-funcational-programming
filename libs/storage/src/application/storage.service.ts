import { Admin, FileRef, Folder, Owner, PermissionWrapper } from '../domain';
import { StorageRepository } from '@app/persistence';

export class StorageService {
  constructor(private readonly storageRepo: StorageRepository) {}

  addFile(acc: PermissionWrapper<Owner | Admin, Folder, FileRef>) {
    return this.storageRepo.addFile(acc.meta, acc.resource);
  }

  addFiles(acc: PermissionWrapper<Owner | Admin, Folder, FileRef[]>) {
    return this.storageRepo.addFiles(acc.meta, acc.resource);
  }
}

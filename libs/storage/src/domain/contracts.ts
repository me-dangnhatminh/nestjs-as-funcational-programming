import { FolderAgg, StorageRoot, UUID } from './models';

export abstract class IStorageRepository {
  abstract getMyStorage(userId: UUID): Promise<StorageRoot | null>;
  abstract createMyStorage(userId: UUID): Promise<StorageRoot>;

  abstract getStorage(id: UUID, folderId: UUID): Promise<StorageRoot>;
  abstract updateStorage(storage: StorageRoot): Promise<StorageRoot>;

  abstract findFolder(folderId: UUID): Promise<FolderAgg | null>;
  abstract addFolder(folder: FolderAgg): Promise<FolderAgg>;
  abstract updateFolder(folder: FolderAgg): Promise<FolderAgg>;
  abstract removeFolder(folder: FolderAgg): Promise<void>;
}

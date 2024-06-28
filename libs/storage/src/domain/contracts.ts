import { FileRef, Folder, FolderInfo, UUID } from './models';

export abstract class IStorageRepository {
  abstract upsertRoot(userId: UUID): Promise<Folder>;

  abstract getFileRef(id: UUID): Promise<FileRef | null>;
  abstract getFolder(id: UUID): Promise<Folder | null>;
  abstract addFile(item: FileRef, folder: Folder): Promise<void>;
  abstract addFiles(items: FileRef[], folder: Folder): Promise<void>;
  abstract hardRemoveFile(item: FileRef): Promise<void>;

  abstract addFolder(item: FolderInfo, folder: Folder): Promise<Folder>;
  abstract addFolders(items: FolderInfo[], folder: Folder): Promise<Folder[]>;
}

export abstract class IDiskStorage {
  abstract getPath(item: FileRef): string | null;
  // abstract createStream(item: FileRef): NodeJS.ReadableStream;
}

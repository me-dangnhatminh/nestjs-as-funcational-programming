import { FileRef, Folder } from './models';

export abstract class IStorageRepository {
  abstract upsertRoot(userId: string): Promise<Folder>;

  abstract getFileRef(id: string): Promise<FileRef | null>;
  abstract getFolder(id: string): Promise<Folder | null>;
  abstract addFile(item: FileRef, folder: Folder): Promise<void>;
  abstract addFiles(items: FileRef[], folder: Folder): Promise<void>;
  abstract hardRemoveFile(item: FileRef): Promise<void>;

  // abstract getFolderLazy(id: string): Promise<Folder | null>;
  abstract getContentLazy(parentId: string): Promise<Folder[]>;
  abstract getFolderLazy(id: string): Promise<Folder | null>;
  abstract addFolder(item: Folder, parent: Folder): Promise<void>;
}

export abstract class IDiskStorage {
  abstract getPath(item: FileRef): string | null;
  // abstract createStream(item: FileRef): NodeJS.ReadableStream;
}

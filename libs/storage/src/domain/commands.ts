import { AccessorId, FileRef, OwnerId, StorageRoot, UUID } from '.';
import { Either as E } from 'effect';
import { ErrorTypes } from '../common';

// -- common types
type NonEmptyArray<T> = [T, ...T[]];
type Event<TType extends string, TData> = { type: TType; data: TData };
// type InferEvent<T> = T extends Event<infer TType, infer TData> ? TData : never;

// -- add file
type FileAddedEvent = Event<'FileAdded', { folderId: UUID; file: FileRef }>;

type AddFileFailure = ErrorTypes.NotPermitted | ErrorTypes.NotEnoughSpace;
type AddFileSuccess = NonEmptyArray<FileAddedEvent>;
type AddFileResult = E.Either<AddFileSuccess, AddFileFailure>;

function FileAddedEvent(data: FileAddedEvent['data']): FileAddedEvent {
  return { type: 'FileAdded', data };
}

const AddFileEvent = (data: FileAddedEvent['data']): FileAddedEvent => ({
  type: 'FileAdded',
  data,
});

const isOwnerOf = (
  root: StorageRoot,
  acessorId: AccessorId,
): acessorId is OwnerId => root.id === acessorId;

export type AddFileParams = [StorageRoot, AccessorId, FileRef];
const addFile = (...parms: AddFileParams): AddFileResult => {
  const [root, acessorId, file] = parms;
  const isOwner = isOwnerOf(root, acessorId);
  if (!isOwner) return E.left(ErrorTypes.NotPermitted);
  const free = root.totalSpace - root.usedSpace;
  const isEnoughSpace = free >= file.size;
  if (isEnoughSpace) return E.left(ErrorTypes.NotEnoughSpace);
  const folderId = root.id;
  return E.right([AddFileEvent({ folderId, file })]);
};

// -- remove file
type FileRemovedEvent = Event<'FileRemoved', { folderId: UUID; fileId: UUID }>;
type RemoveFileFailure = ErrorTypes.NotPermitted;
type RemoveFileSuccess = NonEmptyArray<FileRemovedEvent>;
type RemoveFileResult = E.Either<RemoveFileSuccess, RemoveFileFailure>;

function FileRemovedEvent(data: FileRemovedEvent['data']): FileRemovedEvent {
  return { type: 'FileRemoved', data };
}

const removeFile = (
  parms: [StorageRoot, AccessorId, UUID],
): RemoveFileResult => {
  const [root, acessorId, fileId] = parms;
  const isOwner = isOwnerOf(root, acessorId);
  if (!isOwner) return E.left(ErrorTypes.NotPermitted);
  const folderId = root.id;
  const event = FileRemovedEvent({ folderId, fileId });
  return E.right([event]);
};

export { isOwnerOf, addFile, removeFile };

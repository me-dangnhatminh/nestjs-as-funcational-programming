import { AccessorId, FileRef, OwnerId, StorageRoot, UUID } from '.';
import { Either as E } from 'effect';
// -- common types
type NonEmptyArray<T> = [T, ...T[]];
type Event<TType extends string, TData> = { type: TType; data: TData };

// -- add file
type FileAddedEventData = { folderId: UUID; file: FileRef };
type FileAddedEvent = Event<'FileAdded', FileAddedEventData>;
type AddFileFailure = 'NotPermitted' | 'NotEnoughSpace';
type Added = NonEmptyArray<FileAddedEvent>;
type AddFileResult = E.Either<Added, AddFileFailure>;

const isOwnerOf = (
  root: StorageRoot,
  acessorId: AccessorId,
): acessorId is OwnerId => root.id === acessorId;
const addFile = (parms: [StorageRoot, AccessorId, FileRef]): AddFileResult => {
  const [root, acessorId, file] = parms;
  const isOwner = isOwnerOf(root, acessorId);
  if (!isOwner) return E.left('NotPermitted');
  const free = root.totalSpace - root.usedSpace;
  const isEnoughSpace = free >= file.size;
  if (isEnoughSpace) return E.left('NotEnoughSpace');
  const folderId = root.ref.id;
  const event: FileAddedEvent = { type: 'FileAdded', data: { folderId, file } };
  return E.right([event]);
};

// -- remove file
type FileRemovedEventData = { folderId: UUID; fileId: UUID };
type FileRemovedEvent = Event<'FileRemoved', FileRemovedEventData>;
type RemoveFileFailure = 'NotPermitted';
type RemoveFileResult = E.Either<
  NonEmptyArray<FileRemovedEvent>,
  RemoveFileFailure
>;

const removeFile = (
  parms: [StorageRoot, AccessorId, UUID],
): RemoveFileResult => {
  const [root, acessorId, fileId] = parms;
  const isOwner = isOwnerOf(root, acessorId);
  if (!isOwner) return E.left('NotPermitted');
  const folderId = root.ref.id;
  const event: FileRemovedEvent = {
    type: 'FileRemoved',
    data: { folderId, fileId },
  };
  return E.right([event]);
};

export { isOwnerOf, addFile, removeFile };

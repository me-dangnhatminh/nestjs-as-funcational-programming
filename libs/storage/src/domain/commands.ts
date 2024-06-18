import { AccessorId, FileRef, OwnerId, StorageRoot, UUID } from '.';
import { Either as E } from 'effect';
// -- common types
type NonEmptyArray<T> = [T, ...T[]];
type Event<TType extends string, TData> = { type: TType; data: TData };

// -- add file
type FileAddedEvent = Event<'FileAdded', { folderId: UUID; file: FileRef }>;
type AddFileFailure = 'NotPermitted' | 'NotEnoughSpace';
type Added = NonEmptyArray<FileAddedEvent>;
type AddFileResult = E.Either<Added, AddFileFailure>;

const AddFileEvent = (data: FileAddedEvent['data']): FileAddedEvent => ({
  type: 'FileAdded',
  data,
});

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
  return E.right([AddFileEvent({ folderId, file })]);
};

// -- remove file
type FileRemovedEvent = Event<'FileRemoved', { folderId: UUID; fileId: UUID }>;
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

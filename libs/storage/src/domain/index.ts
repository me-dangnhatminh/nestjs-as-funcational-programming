import * as z from 'zod';

// ============================= Types ============================= //
export type Integer = z.infer<typeof Integer>;
export type ByteUnit = z.infer<typeof ByteUnit>;

export type Bytes = z.infer<typeof Bytes>;
export type BytesInteger = z.infer<typeof BytesInteger>;

export type UUID = z.infer<typeof UUID>;
export type ContentTypes = z.infer<typeof ContentTypes>;
export type FileName = z.infer<typeof FileName>;
export type OwnerId = z.infer<typeof OwnerId>;
export type FileRef = z.infer<typeof FileRef>;
export type FolderName = z.infer<typeof FolderName>;
export type FolderType = z.infer<typeof FolderType>;
export type FolderAgg = z.infer<typeof FolderAgg> & {
  content: (FileRef | FolderAgg)[];
};

// ============================= Schemas ============================= //
export const Integer = z.number().int().positive().brand('Integer');
export const ByteUnit = z.literal('B').brand('ByteUnit');
export const Bytes = z
  .string()
  .refine(
    (val) => {
      const splited = val.split(' ');
      if (splited.length !== 2) return false;
      const [num, unit] = splited;
      if (unit !== 'B') return false;
      const numVal = Number(num);
      if (isNaN(numVal)) return false;
      return numVal >= 0;
    },
    { message: 'Invalid Bytes format, should be like "100 B"' },
  )
  .brand('Bytes');
export const BytesInteger = Integer.brand('BytesInteger');

const UUID = z.string().uuid();
const ContentTypes = z.string().brand('ContentTypes');
const FileName = z.string().min(1).max(255).brand('FileName');
const OwnerId = z.string().uuid().brand('OwnerId');

export const FileRef = z
  .object({
    id: UUID,
    name: FileName,
    size: BytesInteger,
    createdAt: z.date(),
    lastModifiedAt: z.date().optional(),
    archivedAt: z.date().optional(),

    // for metadata
    ownerId: OwnerId,
    contentType: ContentTypes,
    thumbnail: z.string().optional(),
    description: z.string().optional(),
  })
  .brand('File');

const FolderName = z.string().min(1).max(255).brand('FolderName');
const FolderType = z.literal('application/vnd.folder').brand('FolderType');
export const FolderAgg = z
  .object({
    id: UUID,
    name: FolderName,
    size: BytesInteger,

    ownerId: OwnerId,
    parentId: UUID.optional(),
    contentType: FolderType,
    content: z.array(z.union([FileRef, z.lazy(() => FolderAgg)])),
  })
  .brand('Folder');

// ============================= Utils ============================= //
// TODO: use DecimalJS for better precision
import { Either as E } from 'effect';
export type RemoveFileError = 'FileNotFound';

const addFile = (
  folder: FolderAgg,
  file: FileRef,
): E.Either<FolderAgg, never> => {
  folder.content.push(file);
  const size = folder.size + file.size;
  folder.size = size as BytesInteger;
  return E.right(FolderAgg.parse(folder));
};

const removeFile = (
  folder: FolderAgg,
  fileId: UUID,
): E.Either<FolderAgg, RemoveFileError> => {
  const fileIndex = folder.content.findIndex((f) => f.id === fileId);
  if (fileIndex === -1) return E.left('FileNotFound');
  const [file] = folder.content.splice(fileIndex, 1);
  const size = folder.size - file.size;
  folder.size = size as BytesInteger;
  return E.right(FolderAgg.parse(folder));
};

export const StorageDomain = {
  addFile,
  removeFile,
};
export default StorageDomain;

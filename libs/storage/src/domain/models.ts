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
export type ReaderId = z.infer<typeof ReaderId>;
export type WriterId = z.infer<typeof WriterId>;
export type AccessorId = OwnerId | ReaderId | WriterId;

export type FileRef = z.infer<typeof FileRef>;
export type FolderName = z.infer<typeof FolderName>;
export type FolderType = z.infer<typeof FolderType>;
export type FolderAgg = z.infer<typeof FolderAgg>;

export type StorageRoot = z.infer<typeof StorageRoot>;
// ============================= Schemas ============================= //
export const Integer = z.number().int();
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
export const BytesInteger = Integer.brand('BytesInteger').refine(
  (val) => val >= 0,
  { message: 'Bytes should not be negative' },
);

export const UUID = z.string().uuid().brand('UUID');
export const ContentTypes = z.string().brand('ContentTypes');
export const FileName = z.string().min(1).max(255).brand('FileName');

export const OwnerId = UUID.brand('OwnerId');
export const ReaderId = UUID.brand('ReaderId');
export const WriterId = UUID.brand('WriterId');

export const FileRef = z
  .object({
    id: UUID,
    name: FileName,
    size: BytesInteger,
    createdAt: z.date(),
    lastModifiedAt: z.date().nullable().default(null),
    archivedAt: z.date().nullable().default(null),

    // for metadata
    ownerId: OwnerId,
    contentType: ContentTypes,
    thumbnail: z.string().nullable().default(null),
    description: z.string().nullable().default(null),
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
    parentId: UUID.nullable(),
    contentType: FolderType,

    // -- contents
    files: z.array(FileRef),
    folderIds: z.array(UUID),
  })
  .brand('FolderAgg');

export const StorageRoot = z
  .object({
    id: UUID,
    totalSpace: BytesInteger,
    usedSpace: BytesInteger,
    ref: FolderAgg,
  })
  .refine((val) => val.totalSpace - val.usedSpace >= 0, {
    message: 'Used space should not be greater than total space',
  })
  .brand('StorageRoot');

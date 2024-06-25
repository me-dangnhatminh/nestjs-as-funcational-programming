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
export type FileKind = z.infer<typeof FileKind>;
export type FolderName = z.infer<typeof FolderName>;
export type FolderKind = z.infer<typeof FolderKind>;
// export type FolderAgg = z.infer<typeof FolderAgg>;
export type ItemKind = z.infer<typeof ItemKind>;

export type StorageRoot = z.infer<typeof StorageRoot>;
// ============================= Schemas ============================= //
export const Integer = z.bigint();
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

export const FileKind = z.literal('application/vnd.file');
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
const FolderKind = z.literal('application/vnd.folder');
const ItemKind = z.union([FolderKind, FileKind]);

const InternalFolder = z.object({
  id: UUID,
  name: FolderName,
  size: BytesInteger,
  createdAt: z.date(),
  archivedAt: z.date().nullable().default(null),
  files: z.array(FileRef),
});
type InternalFolder = z.infer<typeof InternalFolder> & {
  folders: z.infer<typeof FolderAgg>;
};
export const FolderAgg = InternalFolder.extend({
  folders: z.array(z.lazy(() => FolderAgg)),
}).brand('FolderAgg');
export type FolderAgg = InternalFolder;

// z
//   .object({
//     id: UUID,
//     name: FolderName,
//     size: BytesInteger,
//     ownerId: OwnerId,

//     createdAt: z.date().default(() => new Date()),
//     archivedAt: z.date().nullable().default(null),

//     // -- contents
//     files: z.array(FileRef),
//     folders:
//   })
//   .brand('FolderAgg');

export const StorageRoot = z
  .object({
    id: UUID,
    totalSpace: BytesInteger,
    usedSpace: BytesInteger,
  })
  .refine((val) => val.totalSpace - val.usedSpace >= 0, {
    message: 'Used space should not be greater than total space',
  })
  .brand('StorageRoot');

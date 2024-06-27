import * as z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = FolderInfo & { folders: Folder[]; files: FileRef[] };
type FolderInfo = Omit<z.infer<typeof Folder>, 'folders' | 'files'>;

// ============================= Schemas ============================= //
export const UUID = z.string().uuid();
export const Bytes = z.number().min(0);
export const PastTime = z.date().refine((d) => d <= new Date());

export const FileRef = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  createdAt: PastTime,
  pinnedAt: PastTime.nullable(),
  modifiedAt: PastTime.nullable(),
  archivedAt: PastTime.nullable(),
  ownerId: UUID,
  contentType: z.string(),
  thumbnail: z.string().nullable(),
  description: z.string().nullable(),
});

export const Folder = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  createdAt: PastTime,
  pinnedAt: PastTime.nullable(),
  modifiedAt: PastTime.nullable(),
  archivedAt: PastTime.nullable(),
  ownerId: UUID,
  // --- content
  files: z.array(FileRef),
  folders: z.array(z.lazy(() => Folder)),
});

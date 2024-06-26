import * as z from 'zod';

const UUID = z.string().uuid();
const Bytes = z.number().min(0);

export const FileRef = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,

  contentType: z.string(),
  ownerId: UUID,

  createdAt: z.date(),
  lastModifiedAt: z.date().nullable(),
  archivedAt: z.date().nullable(),
});

export const FolderAgg = z.object({
  id: UUID,
  name: z.string(),
  ownerId: UUID,
  size: Bytes,

  files: z.lazy(() => z.array(FileRef)),
  folders: z.lazy(() => z.array(FolderAgg)),
});

export const FolderRoot = FolderAgg.refine((root) => {
  root.id === root.ownerId;
  root.name === 'my-storage';
}, 'Root must be a root folder').brand('FolderRoot');

export type FileRef = z.infer<typeof FileRef>;
export type FolderAgg = z.infer<typeof FolderAgg> & { folders: FolderAgg[] };
export type FolderRoot = z.infer<typeof FolderRoot>;

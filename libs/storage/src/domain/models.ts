import * as z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = FolderInfo & { folders: Folder[]; files: FileRef[] };
export type FolderInfo = Omit<z.infer<typeof Folder>, 'folders' | 'files'>;

export type Owner = z.infer<typeof Owner>;
export type Viewer = z.infer<typeof Viewer>;
export type Editor = z.infer<typeof Editor>;
export type Admin = z.infer<typeof Admin>;
export type Accessor = z.infer<typeof Accessor>;

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
  files: z.array(z.lazy(() => FileRef)),
  folders: z.array(z.lazy(() => Folder)),
});

// =========

export const Accessor = z.object({ id: UUID });
export const Owner = Accessor.brand('Owner');
export const Viewer = Accessor.brand('Viewer');
export const Editor = Accessor.brand('Editor');
export const Admin = Accessor.brand('Admin');

export type ResourceTypes = Folder | FileRef;
export type AccessorTypes = Owner | Viewer | Editor | Admin;
export type PermissionWrapper<
  A extends AccessorTypes = AccessorTypes,
  R extends ResourceTypes = ResourceTypes,
  Meta = unknown,
> = Readonly<{
  accessor: A;
  resource: R;
  meta: Meta;
}>;

const isOwner = (
  accessor: Accessor,
  resource: Folder | FileRef,
): accessor is Owner => accessor.id === resource.ownerId;

export const Permissions = Object.freeze({ isOwner });

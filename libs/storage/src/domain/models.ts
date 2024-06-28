import * as z from 'zod';

export type UUID = z.infer<typeof UUID>;
export type Bytes = z.infer<typeof Bytes>;
export type PastTime = z.infer<typeof PastTime>;
export type FileRef = z.infer<typeof FileRef>;
export type Folder = z.infer<typeof Folder> &
  Partial<{ files: FileRef[]; folders: Folder[] }>;
export type FolderInfo = z.infer<typeof FolderInfo>;

export type Owner = z.infer<typeof Owner>;
export type Viewer = z.infer<typeof Viewer>;
export type Editor = z.infer<typeof Editor>;
export type Admin = z.infer<typeof Admin>;
export type Accessor = z.infer<typeof Accessor>;

// ============================= Schemas ============================= //
export const UUID = z.string().uuid();
export const Bytes = z.number().int().min(0);
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

export const FolderInfo = z.object({
  id: UUID,
  name: z.string(),
  size: Bytes,
  ownerId: UUID,
  createdAt: PastTime,
  pinnedAt: PastTime.nullable(),
  modifiedAt: PastTime.nullable(),
  archivedAt: PastTime.nullable(),
});
export const Folder = FolderInfo.extend({
  rootId: UUID.nullable(),
  parentId: UUID.nullable(),
  depth: z.number().int().min(0),
  lft: z.number().int().min(0),
  rgt: z.number().int().min(0),
  files: z.lazy(() => z.array(FileRef)),
  folders: z.lazy(() => z.array(Folder)),
});

// ========= Access control ========= //
export const Accessor = z.object({ id: UUID });
export const Owner = Accessor.brand('Owner');
export const Viewer = Accessor.brand('Viewer');
export const Editor = Accessor.brand('Editor');
export const Admin = Accessor.brand('Admin');

export type ResourceTypes = FolderInfo | Folder | FileRef;
export type AccessorTypes = Accessor | Owner | Viewer | Editor | Admin;
export type PermissionWrapper<
  A extends AccessorTypes = AccessorTypes,
  R extends ResourceTypes = ResourceTypes,
  Meta = unknown,
> = Readonly<{
  accessor: A;
  resource: R;
  meta: Meta;
}>;

const isOwner = <
  A extends AccessorTypes = AccessorTypes,
  R extends ResourceTypes = ResourceTypes,
  Meta = unknown,
>(
  accessor: A,
  resource: R,
  meta: Meta,
): PermissionWrapper<Owner, R, Meta> | null => {
  const isOwner = resource.ownerId === accessor.id;
  if (!isOwner) return null;
  return structuredClone({ accessor: Owner.parse(accessor), resource, meta });
};

export const Permissions = {
  isOwner,
} as const;

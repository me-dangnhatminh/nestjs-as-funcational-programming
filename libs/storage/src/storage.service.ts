import { PrismaClient } from '@prisma/client';

export class StorageService {
  constructor(private readonly prisma: PrismaClient) {}

  async getFolderAgg(folderId: string): Promise<{
    id: string;
    name: string;
    parentId: string | null;
    files: { id: string; name: string }[];
    folderIds: string[];
  }> {
    const abc = await this.prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: { include: { file: true } },
        folders: true,
      },
    });
    if (!abc) throw new Error('Folder not found');
    return {
      id: abc.id,
      name: abc.name,
      parentId: abc.parentId,
      files: abc.files.map((f) => ({ id: f.id, name: f.file.name })),
      folderIds: abc.folders.map((f) => f.id),
    };
  }

  // get with depth
  async getFolderAggDepth(
    folderId: string,
    depth: number,
  ): Promise<{
    id: string;
    name: string;
    parentId: string | null;
    files: { id: string; name: string }[];
    folderIds: string[];
  }> {
    const result = await this.prisma.$queryRaw`
      SELECT * FROM folder AS f
      WHERE id = ${folderId}
      AND f.lft BETWEEN f.lft AND f.rgt
    `;
    const abc = result as any;
    if (!abc) throw new Error('Folder not found');
    return {
      id: abc.id,
      name: abc.name,
      parentId: abc.parentId,
      files: abc.files.map((f) => ({ id: f.id, name: f.name })),
      folderIds: abc.folders.map((f) => f.id),
    };
  }
}

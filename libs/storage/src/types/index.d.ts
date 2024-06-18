export declare global {
  namespace Express {
    namespace Multer {
      interface FileExt extends Express.Multer.File {
        id: string;
        name: string;
        size: number;
        ownerId: string;

        createdAt: Date;
        lastModifiedAt: Date | null;
        archivedAt: Date | null;

        thumbnail: string | null;
      }
    }
  }
}

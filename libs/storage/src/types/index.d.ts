import { FileRef } from '../domain';

export declare global {
  namespace Express {
    namespace Multer {
      interface FileExt extends Express.Multer.File {
        extended: FileRef;
      }
    }
  }
}

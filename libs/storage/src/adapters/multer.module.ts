import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Request, RequestWithUser } from 'express';
import * as RxJs from 'rxjs';
import { v4 as uuid } from 'uuid';

const DIST_PREFIX = 'uploads';
const ROLLBACK_EVENT = 'UPLOAD_FAILED';

export const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = path.resolve(DIST_PREFIX);
    Object.assign(file, { destination });
    return cb(null, destination);
  },
  filename: (req: RequestWithUser, file: Express.Multer.FileExt, cb) => {
    const { destination } = file;

    const id = uuid();
    const filename = `${id}`;
    const fullpath = path.join(destination, filename);

    Object.assign(file, {
      id: id,
      ownerId: req.user.id,
      name: file.originalname,
      contentType: file.mimetype,
      createdAt: new Date(),
      lastModifiedAt: null,
      archivedAt: null,

      thumbnail: null,

      path: fullpath,
    });

    const rollback = () => req.on(ROLLBACK_EVENT, () => fs.unlink(file.path));
    file.stream.on('end', rollback);

    cb(null, filename);
  },
});

@Injectable()
export class RollbackFileUploadedInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): RxJs.Observable<unknown> {
    const request: Request = context.switchToHttp().getRequest();
    const emitRollback = (err: unknown) => request.emit(ROLLBACK_EVENT, err);
    return next.handle().pipe(RxJs.tap({ error: emitRollback }));
  }
}

export function RollbackFileUploaded() {
  return UseInterceptors(RollbackFileUploadedInterceptor);
}

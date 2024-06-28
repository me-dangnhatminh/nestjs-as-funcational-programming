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
import { FileRef } from '../../domain';

const DIST_PREFIX = 'dist/uploads';
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

    const extend: FileRef = {
      id: id as any,
      name: file.originalname,
      size: file.size as any,
      createdAt: new Date(),
      modifiedAt: null,
      archivedAt: null,
      pinnedAt: null,
      ownerId: req.user.id as any,
      contentType: file.mimetype,
      thumbnail: null,
      description: null,
    };

    file.path = fullpath;
    file.extended = extend;

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

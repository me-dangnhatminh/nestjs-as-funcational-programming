import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Module,
  NestInterceptor,
  Provider,
} from '@nestjs/common';
import { Request } from 'express';
import * as RxJs from 'rxjs';
import { v4 as uuid } from 'uuid';
import { FileRef, IDiskStorage } from '@app/storage/domain';
import { MulterModule as NestMulter } from '@nestjs/platform-express';

import { APP_INTERCEPTOR } from '@nestjs/core';

@Injectable()
export class FileRollbackInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): RxJs.Observable<unknown> {
    const request: Request = context.switchToHttp().getRequest();
    const emitRollback = (err: unknown) => request.emit(ROLLBACK_EVENT, err);
    return next.handle().pipe(RxJs.tap({ error: emitRollback }));
  }
}

@Injectable()
class MulterDiskStorage implements IDiskStorage, MulterOptionsFactory {
  private readonly destination = path.resolve(DIST_PREFIX);

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          Object.assign(file, { destination: this.destination });
          return cb(null, this.destination);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
          const { destination } = file;

          const id = uuid();
          const filename = `${id}`;
          const fullpath = path.join(destination, filename);
          file.path = fullpath;
          const rollback = () =>
            req.on(ROLLBACK_EVENT, () => fs.unlink(file.path));
          file.stream.on('end', rollback);

          cb(null, filename);
        },
      }),
    };
  }

  getPath(item: FileRef) {
    const fullpath = path.join(this.destination, item.id);
    return fs.existsSync(fullpath) ? fullpath : null;
  }
}

const DIST_PREFIX = 'D:/uploads'; // TODO: move to config
const ROLLBACK_EVENT = 'UPLOAD_FAILED';

const diskStorage: Provider = {
  provide: IDiskStorage,
  useClass: MulterDiskStorage,
};

const rollbackInterceptor: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: FileRollbackInterceptor,
};

@Module({
  imports: [NestMulter.registerAsync({ useClass: MulterDiskStorage })],
  providers: [diskStorage, rollbackInterceptor],
  exports: [NestMulter, diskStorage],
})
export class MulterModule {}
export default MulterModule;

// ================================= INTERCEPTOR =================================

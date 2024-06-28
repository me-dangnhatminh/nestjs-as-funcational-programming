import {
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { FileInterceptor } from '@nestjs/platform-express';

import { Authenticated } from '@app/auth';
import { diskStorage, RollbackFileUploaded } from '../adapters';
import { StorageService } from '../../application/storage.service';
// import { Accessor, FileRef, Permissions } from '../../domain';

@Controller('storage')
@UseGuards(Authenticated)
export class UploadedFileUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('my')
  @Transactional()
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage }))
  @RollbackFileUploaded()
  async execute(@Req() req) {
    // // ----------------- Access control -----------------
    // const accessor = Accessor.parse(req.user);
    // const folder = await this.storageService.getFolder(accessor.id);
    // if (!folder) throw new Error('Root not found');
    // const isOwner = Permissions.isOwner(accessor, folder);
    // if (!isOwner) throw new Error('Not owner');
    // // --------------------------------------------------
    // const fileRef = FileRef.parse(req.file);
  }
}
export default UploadedFileUseCase;

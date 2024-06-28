import { Authenticated, useZodPipe } from '@app/auth';
import { UUID } from '@app/auth/domain';
import { StorageService } from '@app/storage/application';
import {
  Accessor,
  FolderInfo,
  PastTime,
  Permissions,
} from '@app/storage/domain';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestWithUser, Response } from 'express';

type FolderUploadDTO = {};

@Controller('storage')
@UseGuards(Authenticated)
export class FolderUploadUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Post('folders')
  @UseInterceptors(FileInterceptor('file'))
  async excute() {
    //
  }
}

import { Authenticated } from '@app/auth';
import { StorageService } from '@app/storage/application';
import { Controller, Get, UseGuards } from '@nestjs/common';

@Controller('storage')
@UseGuards(Authenticated)
export class FolderContentUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Get('folders/:id')
  async excute() {}
}

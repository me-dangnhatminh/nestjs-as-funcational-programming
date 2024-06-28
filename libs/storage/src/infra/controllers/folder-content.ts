import { StorageService } from '@app/storage/application';
import { Controller, Get, Param, Query } from '@nestjs/common';

@Controller('storage')
export class FolderContentUseCase {
  constructor(private readonly storageService: StorageService) {}

  @Get('folders/:id')
  async excute(
    @Param('id') id: string,
    @Query('depth') depth: number,
    @Query('isFlat') isFlat: boolean,
  ) {
    return await this.storageService.getFolderContent();
  }
}

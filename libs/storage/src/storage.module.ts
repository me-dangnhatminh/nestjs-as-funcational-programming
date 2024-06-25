import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';

import { FirebaseModule } from './adapters';
import { StorageRepository } from './storage.repository';

@Module({
  imports: [FirebaseModule],
  providers: [StorageRepository],
  controllers: [StorageController],
})
export class StorageModule {}

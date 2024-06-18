import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';

import { FirebaseModule } from './adapters';

@Module({
  imports: [FirebaseModule],
  controllers: [StorageController],
})
export class StorageModule {}

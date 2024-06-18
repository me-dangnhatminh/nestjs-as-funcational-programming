import { AuthModule } from '@app/auth';
import { PersistencesModule } from '@app/persistence';
import { StorageModule } from '@app/storage';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    PersistencesModule,
    AuthModule,
    StorageModule,
  ],
})
export class RootModule {}
export default RootModule;

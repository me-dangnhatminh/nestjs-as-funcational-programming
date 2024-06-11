import { AuthModule } from '@app/auth';
import { PersistencesModule } from '@app/persistence';
import { Module } from '@nestjs/common';

@Module({
  imports: [PersistencesModule, AuthModule],
})
export class RootModule {}
export default RootModule;

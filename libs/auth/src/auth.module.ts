import { Module } from '@nestjs/common';

import { AuthController, joiValidationPipe } from './infra';
import { CryptoModule, JwtModule, PersistenceModule } from './infra/adapters';

@Module({
  imports: [JwtModule, CryptoModule, PersistenceModule],
  controllers: [AuthController],
  providers: [joiValidationPipe],
})
export class AuthModule {}

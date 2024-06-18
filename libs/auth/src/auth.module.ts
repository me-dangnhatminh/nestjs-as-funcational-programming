import { Global, Module, ValidationPipe } from '@nestjs/common';

import { controllers } from './infra';
import { CryptoModule, JwtModule, MailerModule } from './infra/adapters';
import { APP_PIPE } from '@nestjs/core';

@Global()
@Module({
  imports: [JwtModule, MailerModule, CryptoModule],
  controllers: [...controllers],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
  exports: [JwtModule, MailerModule, CryptoModule],
})
export class AuthModule {}

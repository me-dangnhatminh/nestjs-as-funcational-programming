import { Module, ValidationPipe } from '@nestjs/common';

import { controllers } from './infra';
import { CryptoModule, JwtModule, MailerModule } from './infra/adapters';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [JwtModule, MailerModule, CryptoModule],
  controllers: [...controllers],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AuthModule {}

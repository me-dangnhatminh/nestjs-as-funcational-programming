import { Module, ValidationPipe } from '@nestjs/common';

import { AuthController } from './infra';
import { CryptoModule, JwtModule } from './infra/adapters';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [JwtModule, CryptoModule],
  controllers: [AuthController],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AuthModule {}

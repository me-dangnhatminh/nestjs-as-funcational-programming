import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { APP_PIPE } from '@nestjs/core';

import { JoiValidationPipe } from './infra';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // TODO: move to env
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [{ provide: APP_PIPE, useClass: JoiValidationPipe }],
})
export class AuthModule {}

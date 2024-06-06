import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secretKey', // TODO: move to env
      signOptions: { expiresIn: '60s' },
    }),
  ],
})
export class AuthModule {}

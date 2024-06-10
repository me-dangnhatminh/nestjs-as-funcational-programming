/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  EmailAddress,
  HashedPassword,
  IUserRepository,
  RawPassword,
  User,
  UserId,
} from '@app/auth/domain';
import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';

import { SignUpBody } from './view-models';
import { v4 as uuid } from 'uuid';
import * as RxJs from 'rxjs';

import { CryptoService, JwtService } from '../adapters';
import { HashPasswordPipe, ValidationUnusedEmail } from '../pipes';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtSer: JwtService,
    private readonly cryptoSer: CryptoService,
  ) {}

  @Post('email/sign-up')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(ValidationUnusedEmail, HashPasswordPipe)
  signUp(@Body() body: SignUpBody) {
    const handle = RxJs.of(body).pipe(
      RxJs.map((cmd) =>
        User.of({
          id: UserId.of(uuid()),
          provider: 'local',
          email: cmd.email,
          password: cmd.password,
          createdAt: new Date(),
        }),
      ),
      RxJs.tap(this.userRepo.add),
    );
    return RxJs.lastValueFrom(handle);
  }
}

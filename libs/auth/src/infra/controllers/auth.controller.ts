/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HashedPassword,
  IUserRepository,
  User,
  UserId,
} from '@app/auth/domain';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { SignUpDTO } from './view-models';
import { v4 as uuid } from 'uuid';
import * as RxJs from 'rxjs';
import { HashPasswordPipe, useJoiPipe } from '../pipes';
import { JwtService } from '../adapters';
import AuthHelper from '../helpers/auth.helper';
import { Function as F } from 'effect';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  @Post('email/sign-up')
  @HttpCode(HttpStatus.CREATED)
  signUp(
    @Body(useJoiPipe(SignUpDTO), HashPasswordPipe)
    body: SignUpDTO & { password: HashedPassword },
    @Res({ passthrough: true }) res: Response,
  ) {
    const cmd = RxJs.of(body).pipe(
      RxJs.map((cmd) =>
        User.of({
          id: UserId.of(uuid()),
          provider: 'local',
          email: cmd.email,
          password: cmd.password,
          createdAt: new Date(),
        }),
      ),
    );

    const persist = cmd.pipe(RxJs.switchMap(this.userRepo.add));

    const setCookie = cmd.pipe(
      RxJs.map(this.jwtService.genAT),
      RxJs.map(AuthHelper.setTokenToCookie(res)),
    );

    return RxJs.concat(persist, setCookie);
  }
}

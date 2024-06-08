import {
  EmailAddress,
  IAuthService,
  IUserRepository,
  RawPassword,
  User,
  UserId,
} from '@app/auth/domain';
import { Body, Controller, Post, Res } from '@nestjs/common';

import { SignUpBody } from './view-models';
import { ValidationUnusedEmail } from '../validators';
import { v4 as uuid } from 'uuid';
import * as RxJs from 'rxjs';
import { Response } from 'express';

const AuthHelper = {
  addTokenToResponse: (res: Response, token: string) => {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
  },
};

function hashPassword<T extends { password: RawPassword }>(
  authSer: IAuthService,
) {
  return (body: T) =>
    authSer
      .hashPassword(body.password)
      .then((password) => ({ ...body, password }));
}

function validateUnusedEmail<T extends { email: EmailAddress }>(
  isUnusedEmail: ValidationUnusedEmail,
) {
  return (body: T) => isUnusedEmail.transform(body.email);
}

function setTokenToResponse<T extends { id: string }>(
  res: Response,
  authSer: IAuthService,
) {
  return (user: T) =>
    authSer
      .genAT(user)
      .then((token) => AuthHelper.addTokenToResponse(res, token));
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly isUnusedEmail: ValidationUnusedEmail,
    private readonly authSer: IAuthService,
    private readonly userRepo: IUserRepository,
  ) {}

  @Post('email/sign-up')
  async signUp(
    @Body() body: SignUpBody,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const workflow = RxJs.of(body).pipe(
      RxJs.tap(validateUnusedEmail(this.isUnusedEmail)),
      RxJs.concatMap(hashPassword(this.authSer)),
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

    workflow.pipe(RxJs.tap(setTokenToResponse(res, this.authSer))); // handle infa layer

    return workflow.toPromise();
  }
}

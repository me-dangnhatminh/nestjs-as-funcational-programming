import {
  EmailAddress,
  HashedPassword,
  IAuthService,
  IUserRepository,
  IUserService,
  RawPassword,
  User,
  UserId,
} from '@app/auth/domain';
import { Body, ConflictException, Controller, Post, Res } from '@nestjs/common';

import { SignUpBody } from './view-models';
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
  return (
    dto: T,
  ): Promise<Omit<T, 'password'> & { password: HashedPassword }> =>
    authSer
      .hashPassword(dto.password)
      .then((password) => ({ ...dto, password }));
}

function validateUnusedEmail<T extends { email: EmailAddress }>(
  userService: IUserService,
) {
  return (dto: T) =>
    userService.getUserByEmail(dto.email).then((user) => {
      if (user)
        throw new ConflictException(`Email ${dto.email} already exists`);
    });
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
    private readonly authSer: IAuthService,
    private readonly userSer: IUserService,
    private readonly userRepo: IUserRepository,
  ) {}

  @Post('email/sign-up')
  async signUp(
    @Body() body: SignUpBody,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const workflow = RxJs.of(body).pipe(
      RxJs.tap(validateUnusedEmail(this.userSer)),
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

      // infa layer
      RxJs.tap(setTokenToResponse(res, this.authSer)), // set token to cookie
      // set location header
      RxJs.map(() => ({ message: 'Sign up successfully' })),
    );

    return workflow.toPromise();
  }
}

import { IUserRepository, User, UserLocalAuth } from '@app/auth/domain';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import * as RxJs from 'rxjs';

import { SignInDTO, SignUpDTO } from './view-models';
import {
  HashPasswordPipe,
  useZodPipe,
  ValidationLocalAuthPipe,
  ValidationUnusedEmail,
} from '../pipes';
import { GenAndSetTokenToCookie } from '../interceptors';
import { AuthHelper } from '../helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepo: IUserRepository, // Write side
  ) {}

  @Post('email/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(GenAndSetTokenToCookie)
  // send welcome email
  signUp(
    @Req() req: Request,
    @Body(useZodPipe(SignUpDTO), ValidationUnusedEmail, HashPasswordPipe)
    dto: unknown,
  ) {
    const user = User.parse(dto);
    AuthHelper.addUserToReq(req)(user);
    const persist = this.userRepo.add(user);
    // add location header
    return RxJs.from(persist);
  }

  @Post('email/sign-in')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(GenAndSetTokenToCookie)
  async signIn(
    @Body(useZodPipe(SignInDTO), ValidationLocalAuthPipe)
    body: UserLocalAuth,
    @Req() req: Request,
  ) {
    const user = User.parse(body);
    AuthHelper.addUserToReq(req)(user);
    return RxJs.of(null);
  }
}

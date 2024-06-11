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
} from '../pipes';
import { GenAndSetTokenToCookie } from '../interceptors';
import { AuthHelper } from '../helpers';

@Controller('auth')
export class AuthController {
  constructor(private readonly userRepo: IUserRepository) {}

  @Post('email/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(GenAndSetTokenToCookie)
  signUp(
    @Body(useZodPipe(SignUpDTO), HashPasswordPipe) dto: unknown,
    @Req() req: Request,
  ) {
    const user = User.parse(dto);
    const persist = RxJs.of(user).pipe(RxJs.switchMap(this.userRepo.add));
    persist.subscribe(() => AuthHelper.addUserToReq(req)(user));
    return RxJs.concat(persist, RxJs.of(null));
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

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
import { Transactional } from '@nestjs-cls/transactional';

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
  @Transactional()
  async signUp(
    @Req() req: Request,
    @Body(useZodPipe(SignUpDTO), ValidationUnusedEmail, HashPasswordPipe)
    dto: unknown,
  ) {
    const user = User.parse(dto);
    AuthHelper.addUserToReq(req)(user);
    await this.userRepo.add(user);
  }

  @Post('email/sign-in')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(GenAndSetTokenToCookie)
  @Transactional()
  async signIn(
    @Body(useZodPipe(SignInDTO), ValidationLocalAuthPipe)
    body: UserLocalAuth,
    @Req() req: Request,
  ) {
    const user = User.parse(body);
    AuthHelper.addUserToReq(req)(user);
  }
}

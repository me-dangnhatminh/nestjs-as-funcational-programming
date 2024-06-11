import {
  EmailComfirmClaim,
  IUserRepository,
  User,
  UserLocalAuth,
  ValidatedEmail,
} from '@app/auth/domain';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, RequestWithUser } from 'express';
import { Transactional } from '@nestjs-cls/transactional';

import { ConfirmEmailDTO, SignInDTO, SignUpDTO } from './view-models';
import {
  useZodPipe,
  HashPassword,
  ValidComfirmToken,
  ValidLocalAuth,
  ValidUnusedEmail,
} from '../pipes';
import { Authenticated } from '../guards';
import { GenAndSetTokenToCookie } from '../interceptors';
import { JwtService, MailerService } from '../adapters';
import { authHelper } from '../helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepo: IUserRepository, // Write side
    // private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('email/sign-up')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(GenAndSetTokenToCookie)
  @Transactional()
  async signUp(
    @Req() req: Request,
    @Body(useZodPipe(SignUpDTO), ValidUnusedEmail, HashPassword)
    dto: unknown,
  ) {
    const user = User.parse(dto);
    authHelper.addUserToReq(req)(user);
    await this.userRepo.add(user);
  }

  @Post('email/sign-in')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(GenAndSetTokenToCookie)
  @Transactional()
  async signIn(
    @Body(useZodPipe(SignInDTO), ValidLocalAuth)
    body: UserLocalAuth,
    @Req() req: Request,
  ) {
    const user = User.parse(body);
    authHelper.addUserToReq(req)(user);
  }

  @Post('email/comfirm')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  async comfirmEmail(
    @Body(useZodPipe(ConfirmEmailDTO), ValidComfirmToken)
    dto: ValidatedEmail,
  ) {
    const user = await this.userRepo.findByEmail(dto.email);
    const updated = User.parse(Object.assign(!user, dto));
    await this.userRepo.update(updated);
  }

  @Post('email/comfirm/resend')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  @UseGuards(Authenticated)
  async resendComfirmEmail(@Req() { user }: RequestWithUser) {
    const isVerified = Boolean(user.verifiedAt);
    if (isVerified) throw new BadRequestException('Email already verified');
    const claim = EmailComfirmClaim.parse({ email: user.email });
    const token = await this.jwtService.genConfirmToken(claim);
    // return this.mailerService.sendConfirmationEmail(user.email, token);
  }
}

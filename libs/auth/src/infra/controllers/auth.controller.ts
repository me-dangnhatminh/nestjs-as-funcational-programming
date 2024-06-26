import {
  EmailAddress,
  HashedPassword,
  IUserRepository,
  toClaim,
  User,
  ValidatedEmail,
} from '@app/auth/domain';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { Transactional } from '@nestjs-cls/transactional';

import {
  ConfirmEmailDTO,
  ResetPasswordDTO,
  SignInDTO,
  SignUpDTO,
} from './view-models';
import {
  useZodPipe,
  HashPassword,
  ValidComfirmToken,
  ValidLocalAuth,
  ValidUnusedEmail,
  ValidForgotPasswordToken,
} from '../pipes';
import { Authenticated } from '../guards';
import { GenAndSetTokenToCookie } from '../interceptors';
import { JwtService, MailerService } from '../adapters';
import { authHelper } from '../helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRepo: IUserRepository, // Write side
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('me')
  @UseGuards(Authenticated)
  getMe(@Req() req) {
    return User.parse(req.user);
  }

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
  async signIn(
    @Body(useZodPipe(SignInDTO), ValidLocalAuth)
    user: User,
    @Req() req: Request,
  ) {
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
  async resendComfirmEmail(@Req() req) {
    const user = User.parse(req.user);
    const isVerified = Boolean(user.verifiedAt);
    if (isVerified) throw new BadRequestException('Email already verified');
    const claim = toClaim(user);
    const token = await this.jwtService.genConfirmToken(claim);
    return this.mailerService.sendConfirmationEmail(user, token);
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  async forgotPassword(@Req() req) {
    const user = User.parse(req.user);
    const claim = toClaim(user);
    const token = await this.jwtService.genForgotPassToken(claim);
    return this.mailerService.sendForgotPasswordEmail(user, token);
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Transactional()
  async resetPassword(
    @Body(useZodPipe(ResetPasswordDTO), ValidForgotPasswordToken, HashPassword)
    { email, password }: { email: EmailAddress; password: HashedPassword },
  ) {
    const user = await this.userRepo.findByEmail(email);
    const updated = User.parse(Object.assign({}, user, { password }));
    await this.userRepo.update(updated);
  }
}

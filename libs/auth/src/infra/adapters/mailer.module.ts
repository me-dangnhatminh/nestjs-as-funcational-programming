import { Injectable, Module } from '@nestjs/common';
import * as NestMailer from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailer: NestMailer.MailerService) {}

  sendConfirmationEmail(user: { email: string }, token: string) {
    const { email } = user;
    return this.mailer.sendMail({
      to: email,
      subject: 'Confirm Email',
      template: 'confirm-email',
      context: { token },
      html: '<b>Confirm Email</b>',
    });
  }

  sendForgotPasswordEmail(user: { email: string }, token: string) {
    const { email } = user;
    return this.mailer.sendMail({
      to: email,
      subject: 'Reset Password',
      template: 'reset-password',
      context: { token },
      html: '<b>Reset Password</b>',
    });
  }
}

@Module({
  imports: [
    NestMailer.MailerModule.forRoot({
      transport: {
        host: 'smtp.example.com', // 'smtp.example.com
        port: 587,
        auth: {
          user: '123456', // '123456
          pass: '123456', // '123456
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}

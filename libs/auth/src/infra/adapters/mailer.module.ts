import { Injectable, Module } from '@nestjs/common';
import * as NestMailer from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailer: NestMailer.MailerService) {}

  sendConfirmationEmail(email: string, token: string) {
    return this.mailer.sendMail({
      to: email,
      subject: 'Confirm Email',
      template: 'confirm-email',
      context: { token },
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

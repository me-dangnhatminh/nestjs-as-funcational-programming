import { Module } from '@nestjs/common';
import * as NestMailer from '@nestjs-modules/mailer';

export class MailerService extends NestMailer.MailerService {
  sendConfirmationEmail(email: string, token: string) {
    return this.sendMail({
      to: email,
      subject: 'Confirm Email',
      template: 'confirm-email',
      context: { token },
    });
  }
}

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}

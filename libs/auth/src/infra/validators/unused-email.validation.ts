import { IUserService, EmailAddress } from '@app/auth/domain';
import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidationUnusedEmail implements PipeTransform<EmailAddress> {
  constructor(private readonly userService: IUserService) {}

  async transform(email: EmailAddress) {
    const exists = await this.userService.getUserByEmail(email).then(Boolean);
    if (exists) throw new ConflictException(`Email ${email} already exists`);
    return email;
  }
}

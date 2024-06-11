import { EmailAddress, IUserRepository } from '@app/auth/domain';
import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';

const EmailAlreadyExists = (email: EmailAddress) =>
  new ConflictException(`Email ${email} already exists`);

@Injectable()
export class ValidUnusedEmail<T extends { email: EmailAddress }>
  implements PipeTransform<T, Promise<T>>
{
  constructor(private readonly userRepo: IUserRepository) {}

  async transform(value: T) {
    const exists = await this.userRepo.findByEmail(value.email).then(Boolean);
    if (exists) throw EmailAlreadyExists(value.email);
    return value;
  }
}

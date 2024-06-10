import { EmailAddress, IUserRepository } from '@app/auth/domain';
import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidationUnusedEmail<T extends { email: EmailAddress }>
  implements PipeTransform<T, Promise<T>>
{
  constructor(private readonly userRepo: IUserRepository) {}

  async transform(value: T) {
    const exists = await this.userRepo.findByEmail(value.email).then(Boolean);
    if (exists)
      throw new ConflictException(`Email ${value.email} already exists`);
    return value;
  }
}

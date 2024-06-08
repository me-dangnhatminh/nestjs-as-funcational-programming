import { HashedPassword, RawPassword } from '@app/auth/domain';
import { PipeTransform, Injectable } from '@nestjs/common';

import { hash } from 'bcrypt';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  async transform(password: RawPassword) {
    const hashed = await hash(password, 10);
    return hashed as HashedPassword;
  }
}

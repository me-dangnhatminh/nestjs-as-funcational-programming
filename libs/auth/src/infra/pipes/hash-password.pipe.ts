import { HashedPassword, RawPassword } from '@app/auth/domain';
import { PipeTransform, Injectable } from '@nestjs/common';
import { CryptoService } from '../adapters';

@Injectable()
export class HashPassword<T extends { password: RawPassword }>
  implements PipeTransform<T, T & { password: HashedPassword }>
{
  constructor(private readonly cryptoService: CryptoService) {}

  transform(value: T): T & { password: HashedPassword } {
    const hashed = this.cryptoService.hashPassword(value.password);
    return Object.assign({}, value, { password: hashed });
  }
}

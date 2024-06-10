import { HashedPassword, RawPassword } from '@app/auth/domain';
import { PipeTransform, Injectable } from '@nestjs/common';
import { CryptoService } from '../adapters';

@Injectable()
export class HashPasswordPipe<T extends { password: RawPassword }>
  implements
    PipeTransform<
      T,
      Promise<{ password: HashedPassword } & Omit<T, 'password'>>
    >
{
  constructor(private readonly cryptoService: CryptoService) {}

  async transform(value: T) {
    const hashed = await this.cryptoService.hashPassword(value.password);
    return { ...value, password: hashed };
  }
}

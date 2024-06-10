import {
  ComparePassword,
  HashedPassword,
  HashPassword,
} from '@app/auth/domain';
import { Global, Module } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

export class CryptoService {
  hashPassword: HashPassword = async (password) => {
    const hashed = await hash(password, 10);
    return hashed as HashedPassword;
  };

  comparePassword: ComparePassword = async (pass, hash) => {
    return compare(pass, hash);
  };
}

@Global()
@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}

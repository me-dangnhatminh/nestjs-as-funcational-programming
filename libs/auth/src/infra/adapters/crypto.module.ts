import { ComparePassword, HashedPassword, RawPassword } from '@app/auth/domain';
import { Global, Module } from '@nestjs/common';
import { compare, hashSync } from 'bcrypt';

export class CryptoService {
  hashPassword(pass: RawPassword): HashedPassword {
    return hashSync(pass, 5) as HashedPassword;
  }

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

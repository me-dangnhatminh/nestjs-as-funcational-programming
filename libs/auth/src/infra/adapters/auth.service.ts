import { HashedPassword, RawPassword } from '@app/auth/domain';
import { compareSync, hashSync, genSaltSync } from 'bcrypt';

// for common use

export class AuthService {
  constructor() {}

  async hashPassword<T extends { password: RawPassword }>(
    data: T,
  ): Promise<HashedPassword> {
    const hashed = hashSync(data.password, genSaltSync(10));
    return hashed as HashedPassword;
  }

  async comparePassword(
    pass: RawPassword,
    hash: HashedPassword,
  ): Promise<boolean> {
    return compareSync(pass, hash);
  }

  async genAT<T extends { id: string }>(data: T): Promise<string> {
    return data.id;
  }

  async decodeAT(token: string): Promise<{ id: string }> {
    return { id: token };
  }
}

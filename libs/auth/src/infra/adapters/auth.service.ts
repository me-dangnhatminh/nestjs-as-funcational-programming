import {
  ComparePasswordSync,
  DecodeAT,
  GenAT,
  HashedPassword,
  HashPasswordSync,
  IAuthService,
  RawPassword,
} from '@app/auth/domain';
import { compareSync, hashSync, genSaltSync } from 'bcrypt';

// for common use

export class AuthService implements IAuthService {
  constructor() {}
  genUUID: () => string = () => {
    throw new Error('Method not implemented.');
  };
  hashPassword: HashPasswordSync = (password: RawPassword) => {
    return hashSync(password, genSaltSync(10)) as HashedPassword;
  };
  comparePassword: ComparePasswordSync = (
    pass: RawPassword,
    hash: HashedPassword,
  ) => {
    return compareSync(pass, hash);
  };
  genAccessToken: GenAT = () => {
    throw new Error('Method not implemented.');
  };

  decodeAccessToken: DecodeAT = () => {
    throw new Error('Method not implemented.');
  };
}

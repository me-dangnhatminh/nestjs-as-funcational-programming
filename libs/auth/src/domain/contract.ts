import User, { EmailAddress, HashedPassword, RawPassword } from './user';
import * as RxJs from 'rxjs';

export abstract class IUserRepository {
  abstract findByEmail(
    email: EmailAddress,
  ): RxJs.Observable<(User & { email: EmailAddress }) | null>;
  abstract findById(id: string): RxJs.Observable<User | null>;
  abstract add(user: User): RxJs.Observable<void>;
  abstract update(user: User): RxJs.Observable<void>;
  abstract remove(user: User): RxJs.Observable<void>;
}

// ============================================= //
// ============== Domain Services ============== //
export type HashPasswordSync = (password: RawPassword) => HashedPassword;
export type ComparePasswordSync = (
  pass: RawPassword,
  hash: HashedPassword,
) => boolean;
export type GenAT = (user: { id: string }) => string;
export type DecodeAT = (token: string) => { id: string };

export type UploadAvatar<T> = (file: T) => RxJs.Observable<void>;
export type DeleteAvatar<T> = (file: T) => RxJs.Observable<void>;
export type GetAvatarUrl<T> = (file: T) => RxJs.Observable<string>;

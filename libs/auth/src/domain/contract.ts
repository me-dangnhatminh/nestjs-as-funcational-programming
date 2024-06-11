import { EmailAddress, HashedPassword, RawPassword, User } from './user.zod';

export abstract class IUserRepository {
  abstract findByEmail(
    email: EmailAddress,
  ): Promise<(User & { email: EmailAddress }) | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract add(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract remove(user: User): Promise<void>;
}

// ============================================= //
// ============== Domain Services ============== //
export type HashPassword = (password: RawPassword) => Promise<HashedPassword>;
export type HashPasswordSync = (password: RawPassword) => HashedPassword;
export type ComparePassword = (
  pass: RawPassword,
  hash: HashedPassword,
) => Promise<boolean>;
export type GenAT = (claims: { id: string }) => Promise<string>;
export type DecodeAT = (token: string) => { id: string };

export type UploadAvatar<T> = (file: T) => Promise<void>;
export type DeleteAvatar<T> = (file: T) => Promise<void>;
export type GetAvatarUrl<T> = (file: T) => Promise<string>;

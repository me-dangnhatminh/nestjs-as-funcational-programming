import User, { HashedPassword, RawPassword } from './user';

export abstract class IUserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract add(user: User): Promise<void>;
  abstract update(user: User): Promise<void>;
  abstract remove(user: User): Promise<void>;
}

// ============================================= //
// ============== Domain Services ============== //
export type HashPassword = (password: RawPassword) => HashedPassword;
export type ComparePassword = (
  pass: RawPassword,
  hash: HashedPassword,
) => boolean;
export type GenAT = (user: { id: string }) => string;
export type DecodeAT = (token: string) => { id: string };

export type UploadAvatar<T> = (file: T) => Promise<void>;
export type DeleteAvatar<T> = (file: T) => Promise<void>;
export type GetAvatarUrl<T> = (file: T) => Promise<string>;

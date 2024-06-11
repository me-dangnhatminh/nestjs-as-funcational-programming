import { LocalAuth, RawPassword, User } from '../domain';

export function validateLocalAuth<TUser extends User>(
  auth: LocalAuth & { password: RawPassword },
  user: TUser | undefined | null = undefined,
): user is TUser & LocalAuth {
  if (!user) return false;
  if (user.provider !== auth.provider) return false;
  if (user.email !== auth.email) return false;
  if (user.password !== auth.password) return false; // TODO: compare password
  return true;
}

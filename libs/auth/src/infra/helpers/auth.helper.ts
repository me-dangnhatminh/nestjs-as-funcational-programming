import { User } from '@app/auth/domain';
import { Response, Request, CookieOptions } from 'express';

function addUserToReq(req: Request) {
  return (user: User) => {
    Object.assign(req, { user });
  };
}

const AUTHENTICATED_KEY = 'x-authenticated-user';
export const getTokenFromReq = (req: Request) => {
  const token = req.cookies[AUTHENTICATED_KEY];
  if (!token) return undefined;
  if (typeof token !== 'string') throw new Error('token is not a string');
  return token;
};

export const getTokenFromCookie = (req: Request) => {
  return req.cookies[AUTHENTICATED_KEY] as string;
};

export const setTokenToCookie =
  (res: Response) => (token: string, options?: CookieOptions) => {
    res.cookie(AUTHENTICATED_KEY, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      ...options,
    });
  };

export const authHelper = {
  setTokenToCookie,
  getTokenFromCookie,
  addUserToReq,
  getTokenFromReq,
} as const;
export default authHelper;

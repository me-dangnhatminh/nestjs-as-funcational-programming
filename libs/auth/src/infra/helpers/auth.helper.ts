import { User } from '@app/auth/domain';
import { Response, Request, CookieOptions } from 'express';

function addUserToReq(req: Request) {
  return (user: User) => {
    Object.assign(req, { user });
  };
}

const addTokenToRes = (res: Response) => (token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

const setTokenToCookie = (res: Response) => (token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

const AUTHENTICATED_KEY = 'x-authenticated-user';
export const getTokenFromReq = (req: Request) => {
  const token = req.cookies[AUTHENTICATED_KEY];
  if (!token) return undefined;
  if (typeof token !== 'string') throw new Error('token is not a string');
  return token;
};
export const setTokenToRes =
  (res: Response) => (token: string, options?: CookieOptions) => {
    res.cookie(AUTHENTICATED_KEY, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      ...options,
    });
  };

export const authHelper = {
  addTokenToRes,
  setTokenToCookie,
  addUserToReq,
  getTokenFromReq,
  setTokenToRes,
} as const;
export default authHelper;

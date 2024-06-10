import { CookieOptions, Response, Request } from 'express';

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

export const AuthHelper = {
  addTokenToRes,
  setTokenToCookie,
} as const;
export default AuthHelper;

import { Response } from 'express';

const addTokenToRes = (res: Response) => (token: string) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
};

export const AuthHelper = {
  addTokenToRes,
} as const;
export default AuthHelper;

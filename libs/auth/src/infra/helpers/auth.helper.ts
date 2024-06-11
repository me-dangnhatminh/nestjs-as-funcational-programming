import { User } from '@app/auth/domain';
import { Response, Request } from 'express';

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

export const AuthHelper = {
  addTokenToRes,
  setTokenToCookie,
  addUserToReq,
} as const;
export default AuthHelper;

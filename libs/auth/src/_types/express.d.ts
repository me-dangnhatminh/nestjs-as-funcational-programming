import 'express';

import { User } from '../domain';

export declare module 'express' {
  interface RequestWithUser extends Request {
    user: User;
  }
}

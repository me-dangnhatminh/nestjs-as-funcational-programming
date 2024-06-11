import 'express';

import { User } from '../domain';

declare module 'express' {
  interface RequestWithUser extends Request {
    user: User;
  }
}

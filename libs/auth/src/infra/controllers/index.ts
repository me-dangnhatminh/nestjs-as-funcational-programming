export * from './auth.controller';
export * from './user.controller';

import { AuthController } from './auth.controller';
import UserController from './user.controller';

export const controllers = [AuthController, UserController];
export default controllers;

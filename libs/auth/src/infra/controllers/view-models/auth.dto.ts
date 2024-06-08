import {
  EmailAddress,
  EmailSchema,
  RawPassword,
  RawPasswordSchema,
} from '@app/auth/domain';
import * as Joi from 'joi';

export type SignUpBody = { email: EmailAddress; password: RawPassword };
export const SignUpBody = Joi.object<SignUpBody>({
  email: EmailSchema,
  password: RawPasswordSchema,
});

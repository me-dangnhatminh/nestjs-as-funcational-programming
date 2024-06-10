import {
  EmailAddress,
  EmailSchema,
  HashedPassword,
  HashedPasswordSchema,
} from '@app/auth/domain';
import * as Joi from 'joi';

export type SignUpBody = { email: EmailAddress; password: HashedPassword };
export const SignUpBody = Joi.object<SignUpBody>({
  email: EmailSchema.required(),
  password: HashedPasswordSchema.required(),
});

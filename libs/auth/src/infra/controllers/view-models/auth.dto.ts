import {
  EmailAddress,
  RawPassword,
  EmailSchema,
  RawPasswordSchema,
} from '@app/auth/domain';

import * as Joi from 'joi';

export type SignUpDTO = {
  email: EmailAddress;
  password: RawPassword;
};

export const SignUpDTO = Joi.object<SignUpDTO, true>({
  email: EmailSchema.required(),
  password: RawPasswordSchema.required(),
}).options({ abortEarly: false });

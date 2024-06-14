import { EmailAddress, RawPassword } from '@app/auth/domain';
import * as z from 'zod';

import { v4 as uuid } from 'uuid';
export const SignUpDTO = z
  .object({
    id: z
      .string()
      .transform(() => uuid())
      .default(uuid),
    provider: z.literal('local').default('local'),
    email: EmailAddress,
    password: RawPassword,

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().optional(),
  })
  .strict();
export type SignUpDTO = z.infer<typeof SignUpDTO>;

export const SignInDTO = z
  .object({
    provider: z.literal('local').default('local'),
    email: EmailAddress,
    password: RawPassword,
  })
  .strict();
export type SignInDTO = z.infer<typeof SignInDTO>;

export const ConfirmEmailDTO = z.object({ token: z.string() });
export type ConfirmEmailDTO = z.infer<typeof ConfirmEmailDTO>;

export const ResetPasswordDTO = z.object({
  token: z.string(),
  password: RawPassword,
});
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

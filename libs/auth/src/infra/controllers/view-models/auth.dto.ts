import { EmailAddress, RawPassword } from '@app/auth/domain';
import { v4 as uuid } from 'uuid';
import * as z from 'zod';

export const SignUpDTO = z
  .object({
    id: z
      .string()
      .uuid()
      .default(() => uuid()),
    provider: z.literal('local').default('local'),
    email: EmailAddress,
    password: RawPassword,

    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatarUrl: z.string().optional(),

    createdAt: z.date().default(() => new Date()),
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

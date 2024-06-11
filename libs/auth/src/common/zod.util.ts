import * as z from 'zod';
// import { Either as E } from 'effect';

// const toEither = <T = unknown, U = unknown>(
//   result: z.SafeParseReturnType<T, U>,
// ): E.Either<z.ZodError<T>, T> => {
//   return result.success ? E.right(result.data) : E.left(result.error);
// };

export function wapper<T>(schema: z.ZodType<T>) {
  return {
    is: (v: unknown): v is T => schema.safeParse(v).success,
    parse: (v: unknown): T => schema.parse(v),
    of: (v: unknown): T => schema.parse(v),
  };
}

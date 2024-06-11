import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

import * as z from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodType<any>) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (result.success) return result.data;
    const msg = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    throw new BadRequestException(msg);
  }
}

export function useZodPipe<T = unknown>(schema: z.ZodType<T>) {
  return new ZodValidationPipe(schema);
}

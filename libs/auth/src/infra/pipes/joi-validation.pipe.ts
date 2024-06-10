import { PipeTransform, BadRequestException, Provider } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import * as Joi from 'joi';

export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.Schema) {}

  transform(value: unknown) {
    const result = this.schema.validate(value);
    if (result.error) throw new BadRequestException(result.error.message);
    return result.value;
  }
}

export function useJoiPipe(schema: Joi.Schema) {
  return new JoiValidationPipe(schema);
}

export const joiValidationPipe: Provider = {
  provide: APP_PIPE,
  useValue: JoiValidationPipe,
};

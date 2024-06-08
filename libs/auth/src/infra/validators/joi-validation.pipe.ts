import { PipeTransform, BadRequestException } from '@nestjs/common';
import * as Joi from 'joi';

export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.Schema) {}

  transform(value: unknown) {
    const result = this.schema.validate(value);
    if (result.error) throw new BadRequestException(result.error.message);
    return result.value;
  }
}

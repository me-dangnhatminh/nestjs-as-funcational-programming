import * as Joi from 'joi';
import { Either as E } from 'effect';
const toEither = <T>(
  result: Joi.ValidationResult<T>,
): E.Either<T, Joi.ValidationError> => {
  return result.error ? E.left(result.error) : E.right(result.value);
};

const toError = (error: Joi.ValidationError): Error => {
  return new Error(error.message);
};

export const JoiUtil = {
  toEither,
  toError,
} as const;

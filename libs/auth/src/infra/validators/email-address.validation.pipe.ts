import { EmailAddress } from '@app/auth/domain';
import {
  registerDecorator,
  ValidatorConstraintInterface,
} from 'class-validator';

class EmailAddressValidationPipe implements ValidatorConstraintInterface {
  validate(value: any) {
    return EmailAddress.is(value);
  }
}

export function IsEmailAddress() {
  return function (target: any, propertyName: string) {
    registerDecorator({
      name: 'isEmailAddress',
      target: target.constructor,
      propertyName: propertyName,
      validator: EmailAddressValidationPipe,
    });
  };
}

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EmailAddress, IUserRepository } from '@app/auth/domain';

@ValidatorConstraint({ async: true })
export class EmailAddressValidator implements ValidatorConstraintInterface {
  validate(value: EmailAddress | string): value is EmailAddress {
    return EmailAddress.is(value);
  }

  defaultMessage() {
    return 'Invalid email address';
  }
}

@ValidatorConstraint({ async: true })
export class UniqueEmailValidator implements ValidatorConstraintInterface {
  constructor(private readonly userRepo: IUserRepository) {}

  async validate(value: EmailAddress) {
    return await this.userRepo.findByEmail(value).then(Boolean);
  }

  defaultMessage(): string {
    return `Email address is already taken`;
  }
}

export function IsEmailAddress(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: { message: 'Invalid email address', ...validationOptions },
      constraints: [],
      validator: EmailAddressValidator,
    });
  };
}

export function IsUniqueEmail(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: {
        message: 'Email address is already taken',
        ...validationOptions,
      },
      constraints: [],
      validator: UniqueEmailValidator,
    });
  };
}

import { Reflector } from '@nestjs/core';
import { UserRole } from '@app/auth/domain';

export const AllowRoles = Reflector.createDecorator<UserRole[]>();

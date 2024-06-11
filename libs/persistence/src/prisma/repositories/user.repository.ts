/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Provider } from '@nestjs/common';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';

import { EmailAddress, IUserRepository, User } from '@app/auth/domain';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) {}
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  findByEmail(email: EmailAddress): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  add(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  update(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }

  remove(user: User): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export const userRepository: Provider = {
  provide: IUserRepository,
  useClass: UserRepository,
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, Provider } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { EmailAddress, IUserRepository, User } from '@app/auth/domain';
import { PrismaClient, User as PrismaUser } from '@prisma/client';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaClient>
    >, // TODO: fix this type
  ) {}

  private get tx() {
    return this.txHost.tx as PrismaClient;
  }

  findById(id: string): Promise<User | null> {
    return this.tx.user.findUnique({ where: { id: id } }) as any;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.tx.user.findUnique({
      where: { email: email },
    }) as any;
  }

  add(user: User): Promise<void> {
    const data = user as unknown as PrismaUser;
    return this.tx.user.create({ data }) as any;
  }

  update(user: User): Promise<void> {
    const data = user as unknown as PrismaUser;
    return this.tx.user.update({ where: { id: user.id }, data }) as any;
  }

  remove(user: User): Promise<void> {
    return this.tx.user.delete({ where: { id: user.id } }) as any;
  }
}

export const userRepository: Provider = {
  provide: IUserRepository,
  useClass: UserRepository,
};

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module, Provider } from '@nestjs/common';

// ------- User Repository -------
import { EmailAddress, IUserRepository, User } from '@app/auth/domain';

class UserRepository implements IUserRepository {
  findByEmail(
    email: EmailAddress,
  ): Promise<(User & { email: EmailAddress }) | null> {
    throw new Error('Method not implemented.');
  }
  findById(id: string): Promise<User | null> {
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

// ------- Persistence Module -------
const userRepo: Provider = {
  provide: IUserRepository,
  useClass: UserRepository,
};

@Module({
  providers: [userRepo],
  exports: [userRepo],
})
export class PersistenceModule {}

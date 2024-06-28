import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import repositories from './repositories';

@Module({
  imports: [],
  providers: [PrismaClient, ...repositories],
  exports: [PrismaClient, ...repositories],
})
export class PrismaModule implements OnModuleInit {
  private readonly log = new Logger(PrismaModule.name);
  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit() {
    await this.prisma
      .$connect()
      .then(() => this.log.log('Prisma connected'))
      .catch((error) => this.log.error('Prisma connection error', error));
  }
}
export default PrismaModule;

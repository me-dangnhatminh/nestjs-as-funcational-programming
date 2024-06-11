import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prismaLog = new Logger('PrismaService');

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // await this.$connect()
    //   .then(() => prismaLog.log('Prisma connected'))
    //   .catch((error) => prismaLog.error('Prisma connection error', error));
  }
}

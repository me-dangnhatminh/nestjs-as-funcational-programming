import { Global, Module } from '@nestjs/common';

import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { PrismaModule } from './prisma';
import { PrismaClient } from '@prisma/client';

const clsModule = ClsModule.forRoot({
  plugins: [
    new ClsPluginTransactional({
      imports: [PrismaClient],
      adapter: new TransactionalAdapterPrisma({
        prismaInjectionToken: PrismaClient,
      }),
    }),
  ],
});

@Global()
@Module({
  imports: [PrismaModule, clsModule],
  exports: [PrismaModule],
})
export class PersistencesModule {}

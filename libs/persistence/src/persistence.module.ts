import { Global, Module } from '@nestjs/common';

import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { PrismaClient } from '@prisma/client';
import PrismaModule from './prisma/prisma.module';

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

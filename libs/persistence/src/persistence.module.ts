import { Global, Module } from '@nestjs/common';

import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';

import { PrismaModule, PrismaService } from './prisma';

const clsModule = ClsModule.forRoot({
  plugins: [
    new ClsPluginTransactional({
      imports: [PrismaModule],
      adapter: new TransactionalAdapterPrisma({
        prismaInjectionToken: PrismaService,
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

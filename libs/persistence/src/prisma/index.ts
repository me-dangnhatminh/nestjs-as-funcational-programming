import { Module } from '@nestjs/common';
import repositories from './repositories';
import { PrismaService } from './prisma.service';

@Module({
  imports: [],
  providers: [PrismaService, ...repositories],
  exports: [PrismaService, ...repositories],
})
export class PrismaModule {}
export * from './prisma.service';

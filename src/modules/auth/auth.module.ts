import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    PrismaService,
  ],
})
export class AuthGuardModule {}

import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TxController } from './tx.controller';
import { TxService } from './tx.service';

@Module({
  controllers: [TxController],
  providers: [TxService, PrismaService],
})
export class TxModule {}

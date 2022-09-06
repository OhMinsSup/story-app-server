import { Module } from '@nestjs/common';
import { TxController } from './tx.controller';
import { TxService } from './tx.service';

@Module({
  controllers: [TxController],
  providers: [TxService]
})
export class TxModule {}

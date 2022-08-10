import { Module } from '@nestjs/common';
import { KlaytnService } from './klaytn.service';

@Module({
  providers: [KlaytnService]
})
export class KlaytnModule {}

import Caver from 'caver-js';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { BAOBAB_TESTNET_RPC_URL, KLAYTN } from 'src/common/common.constants';
import { KlaytnService } from './klaytn.service';

@Module({})
@Global()
export class KlaytnModule {
  static forRoot(): DynamicModule {
    return {
      module: KlaytnModule,
      providers: [
        {
          provide: KLAYTN,
          useValue: () => new Caver(BAOBAB_TESTNET_RPC_URL),
        },
        KlaytnService,
      ],
      exports: [KlaytnService],
    };
  }
}

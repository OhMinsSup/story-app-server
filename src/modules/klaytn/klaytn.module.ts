import Caver from 'caver-js';
import { type DynamicModule, Module, Global } from '@nestjs/common';
import { BAOBAB_TESTNET_RPC_URL, KLAYTN } from 'src/constants/config';
// import type { Klaytn } from './klaytn.interface';
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
          useValue: new Caver(BAOBAB_TESTNET_RPC_URL),
        },
        KlaytnService,
      ],
      exports: [KlaytnService],
    };
  }
}

import Caver from 'caver-js';
import { DynamicModule, Global, Module } from '@nestjs/common';
import {
  BAOBAB_TESTNET_RPC_URL,
  KLAYTN,
  FEE_PAYER_WALLET,
} from 'src/common/common.constants';
import { KlaytnService } from './klaytn.service';
import { KlaytnModuleOptions } from './klaytn.interfaces';

@Module({})
@Global()
export class KlaytnModule {
  static forRoot(options: KlaytnModuleOptions): DynamicModule {
    return {
      module: KlaytnModule,
      providers: [
        {
          provide: KLAYTN,
          useValue: new Caver(BAOBAB_TESTNET_RPC_URL),
        },
        {
          provide: FEE_PAYER_WALLET,
          useValue: options,
        },
        KlaytnService,
      ],
      exports: [KlaytnService],
    };
  }
}

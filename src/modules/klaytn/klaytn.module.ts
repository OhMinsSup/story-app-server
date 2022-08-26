import Caver from 'caver-js';
import { type DynamicModule, Module, Global } from '@nestjs/common';
import { KLAYTN, FEE_PAYER_WALLET } from '../../constants/config';
import { KlaytnService } from './klaytn.service';
import type { Klaytn } from './klaytn.interface';

@Module({})
@Global()
export class KlaytnModule {
  static forRoot(options: Klaytn): DynamicModule {
    return {
      module: KlaytnModule,
      providers: [
        {
          provide: KLAYTN,
          useValue: new Caver(options.klaytnNetRpcUrl),
        },
        {
          provide: FEE_PAYER_WALLET,
          useValue: {
            feePayerAddress: options.feePayerAddress,
            feePayerPrivateKey: options.feePayerPrivateKey,
          },
        },
        KlaytnService,
      ],
      exports: [KlaytnService],
    };
  }
}

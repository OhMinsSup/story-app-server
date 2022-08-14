import Caver from 'caver-js';
import { type DynamicModule, Module, Global } from '@nestjs/common';
import { KLAYTN } from 'src/constants/config';
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
        KlaytnService,
      ],
      exports: [KlaytnService],
    };
  }
}

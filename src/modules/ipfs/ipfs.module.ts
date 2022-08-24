import { NFTStorage } from 'nft.storage';
import { type DynamicModule, Global, Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';
import type { Ipfs } from './ipfs.interface';
import { NFT_STORAGE } from 'src/constants/config';

@Module({})
@Global()
export class IpfsModule {
  static forRoot(options: Ipfs): DynamicModule {
    return {
      module: IpfsModule,
      providers: [
        {
          provide: NFT_STORAGE,
          useValue: new NFTStorage({ token: options.nftStorageApiKey }),
        },
        IpfsService,
      ],
      exports: [IpfsService],
    };
  }
}

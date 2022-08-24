import { Inject, Injectable } from '@nestjs/common';
import { type NFTStorage } from 'nft.storage';
import { NFT_STORAGE } from '../../constants/config';

interface IpfsAddParams {
  name: string;
  description: string;
  contentUrl: string;
  tags: string[];
  price: number;
  backgroundColor?: string | null;
  externalSite?: string | null;
}

@Injectable()
export class IpfsService {
  constructor(@Inject(NFT_STORAGE) private readonly client: NFTStorage) {}

  async add(params: IpfsAddParams) {
    const {
      name,
      contentUrl,
      description,
      tags,
      backgroundColor,
      externalSite,
      price,
    } = params;

    const blob = await fetch(contentUrl).then((res) => res.blob());

    return this.client.store({
      name,
      description,
      image: blob,
      properties: {
        contentFile: blob,
        contentUrl,
        price,
        ...(tags && { tags }),
        ...(backgroundColor && {
          backgroundColor,
        }),
        ...(externalSite && {
          externalSite,
        }),
      },
    });
  }
}

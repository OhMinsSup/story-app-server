import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import { type NFTStorage, Blob } from 'nft.storage';
import { NFT_STORAGE } from '../../constants/config';

interface IpfsAddParams {
  name: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  tags: string[];
  price: number;
  backgroundColor?: string | null;
  externalSite?: string | null;
}

@Injectable()
export class IpfsService {
  constructor(@Inject(NFT_STORAGE) private readonly client: NFTStorage) {}

  /**
   * @description IPFS 업로드
   * @param {IpfsAddParams} params
   */
  async add(params: IpfsAddParams) {
    const {
      name,
      thumbnailUrl,
      contentUrl,
      description,
      tags,
      backgroundColor,
      externalSite,
      price,
    } = params;

    const [thumbnail, content] = await Promise.all([
      axios.get(thumbnailUrl, {
        responseType: 'arraybuffer',
      }),
      axios.get(contentUrl, {
        responseType: 'arraybuffer',
      }),
    ]);

    const thumbnailBlob = new Blob([thumbnail.data], {
      type: 'image/jpeg',
    });

    const contentBlob = new Blob([content.data], {
      type: 'application/octet-stream',
    });

    return this.client.store({
      name,
      description,
      image: thumbnailBlob,
      properties: {
        content: contentBlob,
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

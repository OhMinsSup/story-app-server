import { Inject, Injectable } from '@nestjs/common';
import axios from 'axios';
import parseByBytes from 'magic-bytes.js';
import { type NFTStorage, Blob, File } from 'nft.storage';
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

    const resp = await axios.get(thumbnailUrl, {
      responseType: 'arraybuffer',
    });

    const thumbResult = parseByBytes(resp.data);
    const guessedThumb = thumbResult?.[0];

    if (!guessedThumb) {
      const error = new Error();
      error.name = 'InvalidFile';
      error.message = '업로드 할 수 없는 파일입니다.';
      throw error;
    }

    const blob = new Blob([resp.data], {
      type: guessedThumb.mime,
    });

    const thumbnail = new File(
      [blob],
      `${name}_thumbnail.${guessedThumb.extension}`,
      {
        type: guessedThumb.mime,
      },
    );

    const nft = {
      name,
      description,
      image: thumbnail,
      properties: {
        thumbnail: {
          type: 'string',
          value: thumbnailUrl,
        },
        content: {
          type: 'string',
          value: contentUrl,
        },
        price: {
          type: 'number',
          value: price,
        },
        tags: {
          type: 'array',
          value: tags ?? [],
        },
        backgroundColor: {
          type: 'string',
          value: backgroundColor ?? '',
        },
        externalSite: {
          type: 'string',
          value: externalSite ?? '',
        },
      },
    };

    return this.client.store(nft);
  }
}

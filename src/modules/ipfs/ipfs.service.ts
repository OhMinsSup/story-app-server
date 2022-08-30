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

    const [thumbnail, content] = await Promise.all([
      axios.get(thumbnailUrl, {
        responseType: 'arraybuffer',
      }),
      axios.get(contentUrl, {
        responseType: 'arraybuffer',
      }),
    ]);

    const thumbResult = parseByBytes(thumbnail.data);
    const contentResult = parseByBytes(content.data);

    const guessedThumb = thumbResult?.[0];
    const guessedContent = contentResult?.[0];

    if (!guessedThumb || !guessedContent) {
      const error = new Error();
      error.name = 'InvalidFile';
      error.message = '업로드 할 수 없는 파일입니다.';
      throw error;
    }

    // arraybuffer -> blob -> file

    const thumbBlob = new Blob([thumbnail.data], {
      type: guessedThumb.mime,
    });
    const contentBlob = new Blob([content.data], {
      type: guessedContent.mime,
    });

    const thumbFile = new File(
      [thumbBlob],
      `${name}_thumbnail.${guessedThumb.extension}`,
      {
        type: guessedThumb.mime,
      },
    );

    const contentFile = new File(
      [contentBlob],
      `${name}_content.${guessedContent.extension}`,
      {
        type: guessedContent.mime,
      },
    );

    return this.client.store({
      name,
      description,
      image: thumbFile,
      properties: {
        content: contentFile,
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

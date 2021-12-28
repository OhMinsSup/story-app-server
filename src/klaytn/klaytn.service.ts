import { Inject, Injectable } from '@nestjs/common';
import { Contract } from 'caver-js';
import {
  DEPLOYED_ABI,
  KLAYTN,
  GAS,
  DEPLOYED_ADDRESS,
} from 'src/common/common.constants';

import type Caver from 'caver-js';

interface StoryToken {
  tokenId: number;
  storyId: number;
  tokenUrl: string;
  timestamp: number;
  ownerHistory: any[];
}

@Injectable()
export class KlaytnService {
  private contract: Contract | null;
  constructor(@Inject(KLAYTN) private readonly caver: Caver) {
    if ([DEPLOYED_ABI, DEPLOYED_ADDRESS].every(Boolean)) {
      this.contract = new this.caver.klay.Contract(
        DEPLOYED_ABI,
        DEPLOYED_ADDRESS,
      );
    } else {
      this.contract = null;
    }
  }

  /**
   * @description 지갑 생성
   */
  async createWallet() {
    const randomHex = this.caver.utils.randomHex(32);
    return this.caver.klay.accounts.create(randomHex);
  }

  /**
   * @description 주어진 개인키에서 공개키를 도출합니다.
   * @param privateKey
   */
  async privateKeyToPublicKey(privateKey: string) {
    return this.caver.klay.accounts.privateKeyToPublicKey(privateKey);
  }

  /**
   * @description 임의의 데이터에 서명합니다. 데이터는 UTF-8 HEX 디코딩되기 전이며 다음과 같이 포함
   * @param data
   * @param privateKey
   */
  async sign(data: string, privateKey: string) {
    return this.caver.klay.accounts.sign(data, privateKey);
  }

  /**
   * @description 주어진 데이터에 서명하는 데 사용된 Klaytn 주소를 복구합니다.
   * @param signature
   * @param preFixed
   */
  async recover(signature: any, preFixed?: boolean) {
    return this.caver.klay.accounts.recover(signature, preFixed);
  }

  /**
   * @description 서명 ECDSA 서명 r, ECDSA 서명 s. ECDSA 리커버리 id v. recover
   * @param signature
   * @param messageHash
   */
  async recoverSignature(signature: string, messageHash: string) {
    const v = '0x' + signature.substring(2).substring(128, 130);
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);

    const address = await this.recover({
      messageHash,
      v,
      r,
      s,
    });
    return address;
  }

  /**
   * @description 현재 배포된 모든 토큰 카운트값
   */
  async getTotalCount(): Promise<number | null> {
    return this.contract?.methods.getTotalCount().call();
  }

  /**
   * @description 특정 토큰 아이디를 통해서 토큰 정보를 가져오는 메소드
   * @param tokenId
   */
  async getStory(tokenId: number): Promise<StoryToken | null> {
    return this.contract?.methods.getStory(tokenId).call();
  }

  /**
   * @description 토큰 발행
   * @param storyId
   * @param tokenUrl
   */
  async mintStory(storyId: number, tokenUrl: string) {
    return this.contract?.methods
      .mintStory(storyId, tokenUrl)
      .send({
        from: DEPLOYED_ADDRESS,
        gas: GAS,
      })
      .once('transactionHash', (txHash) => {
        console.log(txHash);
      })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
      .once('error', (error) => {
        console.log(error);
      });
  }

  /**
   * @description 소유권 이전
   * @param address
   * @param tokenId
   * @param to
   */
  async transferOwnership(address: string, tokenId: number, to: string) {
    // promies race transferOwnership
    return this.contract?.methods
      .transferOwnership(tokenId, to)
      .send({
        from: address,
        gas: GAS,
      })
      .once('transactionHash', (txHash) => {
        console.log(txHash);
      })
      .once('receipt', (receipt) => {
        console.log(receipt);
      })
      .once('error', (error) => {
        console.log(error);
      });
  }

  /**
   * @description 현재 배포된 모든 토큰을 가져옵니다.
   */
  async getStories() {
    if (!this.contract) {
      throw new Error('Contract is not deployed');
    }

    const totalCount = await this.getTotalCount();
    if (!totalCount) return [];
    const stories = [];
    for (let i = totalCount; i > 0; i--) {
      const story = this.getStory(i);
      stories.push(story);
    }
    return Promise.all(stories);
  }
}

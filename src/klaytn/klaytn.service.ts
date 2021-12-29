import { Inject, Injectable } from '@nestjs/common';
import { Contract } from 'caver-js';
import {
  DEPLOYED_ABI,
  KLAYTN,
  GAS,
  DEPLOYED_ADDRESS,
} from 'src/common/common.constants';

import type Caver from 'caver-js';
import type { SingleKeyring } from 'caver-js';

interface StoryToken {
  tokenId: number;
  storyId: number;
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
   * @description Keyring은 Klaytn 계정의 주소와 개인 키를 포함하는 구조입니다.
   */
  async keyring() {
    const randomHex = this.caver.utils.randomHex(32);
    const keyring: any = (this.caver.wallet as any).keyring;
    return keyring.generate(randomHex) as SingleKeyring;
  }

  /**
   * @description 개인키에서 계정 객체를 생성합니다.
   * @param privateKey
   */
  privateKeyToAccount(privateKey: string) {
    return this.caver.klay.accounts.privateKeyToAccount(privateKey);
  }

  /**
   * @description 개인키 또는 계정 객체를 사용하여 계정을 지갑에 추가합니다.
   * @todo 참고: 지갑에 동일한 주소가 있는 경우에는 오류가 반환됩니다. 지갑의 계정과 관련된 개인키를 변경하려면 caver.klay.accounts.wallet.updatePrivateKey를 사용하세요.
   */
  walletAdd(wallet: any) {
    return this.caver.klay.accounts.wallet.add(wallet);
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
   * @deprecated
   */
  async privateKeyToPublicKey(privateKey: string) {
    return this.caver.klay.accounts.privateKeyToPublicKey(privateKey);
  }

  /**
   * @description 임의의 데이터에 서명합니다. 데이터는 UTF-8 HEX 디코딩되기 전이며 다음과 같이 포함
   * @param data
   * @param privateKey
   * @deprecated
   */
  async sign(data: string, privateKey: string) {
    return this.caver.klay.accounts.sign(data, privateKey);
  }

  /**
   * @description 주어진 데이터에 서명하는 데 사용된 Klaytn 주소를 복구합니다.
   * @param signature
   * @param preFixed
   * @deprecated
   */
  async recover(signature: any, preFixed?: boolean) {
    return this.caver.klay.accounts.recover(signature, preFixed);
  }

  /**
   * @description 서명 ECDSA 서명 r, ECDSA 서명 s. ECDSA 리커버리 id v. recover
   * @param signature
   * @param messageHash
   * @deprecated
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

    if (!this.caver.utils.isAddress(address)) {
      return null;
    }

    const checksumAddress = this.caver.utils.toChecksumAddress(address);
    return checksumAddress;
  }

  /**
   * @description 주어진 주소가 올바른 주소인지 체크
   * @param address
   */
  isAddress(address: string) {
    return this.caver.utils.isAddress(address);
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
   * @param address
   * @param privateKey
   * @param tokenId
   */
  async mint(privateKey: string, storyId: number) {
    // Add a keyring to caver.wallet
    const instance: any = (this.caver.wallet as any).keyring;
    const keyring = instance.createFromPrivateKey(privateKey);
    this.walletAdd(keyring);

    const valueTransfer = this.caver.transaction.valueTransfer.create({
      from: keyring.address,
      to: DEPLOYED_ADDRESS,
      input: this.contract.methods.mintStory(storyId).encodeABI(),
      value: this.caver.utils.toPeb('0.1', 'KLAY'),
      gas: GAS,
    });

    // Sign the transaction via caver.wallet.sign
    await this.caver.wallet.sign(keyring.address, valueTransfer);

    const rlpEncoded = valueTransfer.getRLPEncoding();

    // Send the transaction using `caver.rpc.klay.sendRawTransaction`.
    const receipt = await this.caver.rpc.klay.sendRawTransaction(rlpEncoded);
    console.log(receipt);
    return receipt;
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

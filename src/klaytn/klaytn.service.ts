import { Inject, Injectable } from '@nestjs/common';
import { KLAYTN } from 'src/common/common.constants';

import type Caver from 'caver-js';

@Injectable()
export class KlaytnService {
  constructor(@Inject(KLAYTN) private readonly caver: Caver) {}

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
   */
  async makeSignList(signature: string) {
    const v = '0x' + signature.substring(2).substring(128, 130);
    const r = '0x' + signature.substring(2).substring(0, 64);
    const s = '0x' + signature.substring(2).substring(64, 128);
    return { v, r, s };
  }
}

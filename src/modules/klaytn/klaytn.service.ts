import { Inject, Injectable } from '@nestjs/common';
import type Caver from 'caver-js';
import { Contract } from 'caver-js';
import { DEPLOYED_ABI, DEPLOYED_ADDRESS, KLAYTN } from '../../constants/config';

@Injectable()
export class KlaytnService {
  private contract: Contract | null;

  constructor(@Inject(KLAYTN) private readonly caver: Caver) {
    if ([DEPLOYED_ABI, DEPLOYED_ADDRESS].every(Boolean)) {
      const contractInstance = this.caver.contract.create(
        DEPLOYED_ABI,
        DEPLOYED_ADDRESS,
      );

      this.contract = contractInstance;
    } else {
      this.contract = null;
    }
  }

  /**
   * @description Keyring은 Klaytn 계정의 주소와 개인 키를 포함하는 구조입니다. */
  createWallet() {
    const randomHex = this.caver.utils.randomHex(32);
    return this.caver.wallet.keyring.generate(randomHex);
  }

  /**
   * @description caver-js에서 제공하는 인메모리 지갑을 사용하면 쉽게 Keyring을 사용할 수 있습니다.
   * @param {string} address
   */
  getKeyring(address: string) {
    return this.caver.wallet.getKeyring(address);
  }
}

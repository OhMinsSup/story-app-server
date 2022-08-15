import { Inject, Injectable } from '@nestjs/common';
import type Caver from 'caver-js';
import type { Contract, Keyring, Keystore } from 'caver-js';
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
   * @description 인 메모리에 지갑 등록
   * @param {Keyring} keyring
   */
  walletAdd(keyring: Keyring) {
    return this.caver.wallet.add(keyring);
  }

  /**
   * @description 인 메모리에 지갑 제거
   * @param {string} address
   */
  walletRemove(address: string) {
    return this.caver.wallet.remove(address);
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

  /**
   * @description keystore decrypt를 한다.
   * @param {Keystore} keystore
   * @param {string} password
   */
  decrypt(keystore: Keystore, password: string) {
    return this.caver.wallet.keyring.decrypt(keystore, password);
  }
}

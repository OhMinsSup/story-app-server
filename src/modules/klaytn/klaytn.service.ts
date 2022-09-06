import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Caver from 'caver-js';
import type { Contract, Keyring, Keystore, Unit } from 'caver-js';
import {
  DEPLOYED_ABI,
  DEPLOYED_ADDRESS,
  FEE_PAYER_WALLET,
  KLAYTN,
} from '../../constants/config';

@Injectable()
export class KlaytnService {
  private contract: Contract | null;

  constructor(
    @Inject(KLAYTN) private readonly caver: Caver,
    @Inject(FEE_PAYER_WALLET)
    private readonly feePayer: Record<
      'feePayerPrivateKey' | 'feePayerAddress',
      string
    >,
    private readonly config: ConfigService,
  ) {
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
   * @param {string} privateKey
   */
  getKeyring(address: string, privateKey: string) {
    return this.caver.wallet.keyring.createWithSingleKey(address, privateKey);
  }

  /**
   * @description keystore decrypt를 한다.
   * @param {Keystore} keystore
   * @param {string} password
   */
  decrypt(keystore: Keystore, password: string) {
    return this.caver.wallet.keyring.decrypt(keystore, password);
  }

  /**
   * @description 데이터를 contract에 minting한다.
   * @param {string} privateKey
   * @param {number} itemId
   * @param {string} tokenURI
   */
  async mint(privateKey: string, itemId: number, tokenURI: string) {
    const executor = this.caver.wallet.keyring.createFromPrivateKey(privateKey);
    this.walletAdd(executor);

    const feePayer = this.caver.wallet.keyring.createFromPrivateKey(
      this.feePayer.feePayerPrivateKey,
    );
    this.walletAdd(feePayer);

    const receipt = await this.contract.send(
      {
        from: executor.address,
        gas: 1000000,
        feeDelegation: true,
        feePayer: feePayer.address,
      },
      'createItem',
      executor.address,
      itemId,
      tokenURI,
    );

    let tokenId = null;
    if (Array.isArray(receipt.events.CreateItem)) {
      const values = receipt.events.CreateItem[0]?.returnValues;
      tokenId = values.tokenId;
    } else {
      const values = receipt.events.CreateItem?.returnValues;
      tokenId = values.tokenId;
    }

    return {
      receipt,
      tokenId,
    };
  }

  fromPeb(value: string | number, unit?: Unit) {
    const price = this.caver.utils.fromPeb(value, unit ?? 'KLAY');
    return {
      price,
      unit: unit ?? 'KLAY',
    };
  }

  /**
   * @description 내가 소유한 금액을 조회한다.
   * @param {string} address
   * @link https://medium.com/klaytn/kas%EB%A5%BC-%EC%9D%B4%EC%9A%A9%ED%95%98%EC%97%AC-klaytn-%EC%A7%80%EA%B0%91-%EA%B8%B0%EB%8A%A5-%EA%B0%9C%EB%B0%9C%ED%95%98%EA%B8%B0-1-ced7b6d97668
   */
  getBalance(address: string) {
    return this.caver.rpc.klay.getBalance(address);
  }

  /**
   * @description 트랜잭션 해시로 조회한 트랜잭션의 영수증을 반환합니다.
   * @param {string} transactionHash
   */
  getReceipt(transactionHash: string) {
    return this.caver.rpc.klay.getTransactionReceipt(transactionHash);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import type Caver from 'caver-js';
import type {
  FeeDelegatedTransaction,
  Contract,
  Keyring,
  Keystore,
} from 'caver-js';
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
   * @param {string} address
   * @param {string} privateKey
   * @param {number} itemId
   * @param {string} tokenURI
   */
  async mint(
    address: string,
    privateKey: string,
    itemId: number,
    tokenURI: string,
  ) {
    const toKerging = this.getKeyring(address, privateKey);
    this.walletAdd(toKerging);

    const feeKerging = this.getKeyring(
      this.feePayer.feePayerAddress,
      this.feePayer.feePayerPrivateKey,
    );
    this.walletAdd(feeKerging);

    const signed = (await this.contract.sign(
      {
        from: toKerging.address,
        gas: 1000000,
        feeDelegation: true,
      },
      'mint',
      itemId,
      tokenURI,
      toKerging.address,
    )) as FeeDelegatedTransaction;

    await this.caver.wallet.signAsFeePayer(feeKerging.address, signed);

    const receipt = await this.caver.rpc.klay.sendRawTransaction(signed);

    console.log(receipt.events.Minting);
    const tokenId = (receipt as any).events.Minting?.returnValues?.[0];

    return {
      receipt,
      tokenId,
    };
  }

  /**
   * @description 트랜잭션 해시로 조회한 트랜잭션의 영수증을 반환합니다.
   * @param {string} transactionHash
   */
  getReceipt(transactionHash: string) {
    return this.caver.rpc.klay.getTransactionReceipt(transactionHash);
  }
}

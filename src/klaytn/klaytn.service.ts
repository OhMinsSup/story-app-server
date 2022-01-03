import { Inject, Injectable } from '@nestjs/common';
import { Contract } from 'caver-js';
import {
  DEPLOYED_ABI,
  KLAYTN,
  GAS,
  DEPLOYED_ADDRESS,
  FEE_PAYER_WALLET,
} from 'src/common/common.constants';

import type Caver from 'caver-js';
import type { SingleKeyring } from 'caver-js';
import type { KlaytnModuleOptions } from './klaytn.interfaces';

@Injectable()
export class KlaytnService {
  private contract: Contract | null;
  constructor(
    @Inject(KLAYTN) private readonly caver: Caver,
    @Inject(FEE_PAYER_WALLET)
    private readonly feePayerWallet: KlaytnModuleOptions,
  ) {
    if ([DEPLOYED_ABI, DEPLOYED_ADDRESS].every(Boolean)) {
      this.contract = new this.caver.klay.Contract(
        DEPLOYED_ABI,
        DEPLOYED_ADDRESS,
      );
      console.log(this.contract._address);
    } else {
      this.contract = null;
    }
  }

  /**
   * @description Keyring은 Klaytn 계정의 주소와 개인 키를 포함하는 구조입니다.
   */
  async keyring() {
    const wallet = this.caver.wallet as any;
    const randomHex = this.caver.utils.randomHex(32);
    return wallet.keyring.generate(randomHex) as SingleKeyring;
  }

  /**
   * @description 개인키에서 계정 객체를 생성합니다.
   * @param privateKey
   */
  privateKeyToAccount(privateKey: string) {
    return this.caver.klay.accounts.privateKeyToAccount(privateKey);
  }

  /**
   * @description 주어진 주소가 올바른 주소인지 체크
   * @param address
   */
  isAddress(address: string) {
    return this.caver.utils.isAddress(address);
  }

  /**
   * @description 토큰 발행
   * @param address
   * @param privateKey
   * @param tokenId
   */
  async mint(address: string, privateKey: string, storyId: number) {
    try {
      const senderKeyring = this.caver.klay.accounts.createWithAccountKey(
        address,
        privateKey,
      );
      const feePayerKeyring = this.caver.klay.accounts.createWithAccountKey(
        this.feePayerWallet.feePayerAddress,
        this.feePayerWallet.feePayerPrivateKey,
      );

      // Add a keyring login user address to caver.wallet
      this.caver.klay.accounts.wallet.add(senderKeyring);
      // Add a keyring login fee payer address to caver.wallet
      this.caver.klay.accounts.wallet.add(feePayerKeyring);

      const signedTx: any = await this.caver.klay.accounts.signTransaction(
        {
          type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
          from: senderKeyring.address,
          to: DEPLOYED_ADDRESS,
          data: this.contract?.methods.mintStory(storyId).encodeABI(),
          gas: GAS,
        },
        senderKeyring.privateKey,
      );

      const { rawTransaction } = signedTx;

      const tx = await this.caver.klay.sendTransaction({
        senderRawTransaction: rawTransaction,
        feePayer: feePayerKeyring.address,
      });

      const tokenId = await this.contract?.methods.getTotalCount().call();

      // const setResult = await this.contract?.send(
      //   {
      //     from: senderKeyring.address,
      //     feeDelegation: true,
      //     feePayer: feePayerKeyring.address,
      //     feeRatio: 50, // Without feeRatio, `send` will use FeeDelegatedSmartContractExecution
      //     gas: GAS,
      //   },
      //   'mintStory',
      //   storyId,
      // );

      this.caver.klay.accounts.wallet.clear();

      return {
        ...tx,
        tokenId,
      };
    } catch (error) {
      throw error;
    }
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
}

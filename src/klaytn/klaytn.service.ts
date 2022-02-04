import { Inject, Injectable } from '@nestjs/common';
import { Contract, KeyringContainer } from 'caver-js';
import {
  DEPLOYED_ABI,
  KLAYTN,
  GAS,
  DEPLOYED_ADDRESS,
  FEE_PAYER_WALLET,
} from 'src/common/common.constants';

import type Caver from 'caver-js';
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
    } else {
      this.contract = null;
    }
  }

  /**
   * @description caver.wallet는 인메모리 지갑에서 Keyring 인스턴스를 관리하는 패키지입니다.
   * caver.wallet는 모든 SingleKeyring, MultipleKeyring, RoleBasedKeyring을 받으며,
   * 주소를 기준으로 관리합니다. */
  get wallet() {
    return this.caver.wallet as KeyringContainer;
  }

  /**
   * @description caver.account는 계정 업데이트시 사용 되며 Account에 관련된 기능을 제공하는 패키지입니다. */
  get account() {
    return this.caver.account;
  }

  /**
   * @description Keyring은 Klaytn 계정의 주소와 개인 키를 포함하는 구조입니다. */
  keyring() {
    const randomHex = this.caver.utils.randomHex(32);
    return this.wallet.keyring.generate(randomHex);
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

    // in-memory wallet 에서 계정 정보 삭제
    this.caver.klay.accounts.wallet.clear();

    return {
      ...tx,
      tokenId,
    };
  }

  async buyToken(
    tokenId: number,
    amount: string | number,
    ownerAddress: string,
    ownerPrivateKey: string,
  ) {
    const senderKeyring = this.caver.klay.accounts.createWithAccountKey(
      ownerAddress,
      ownerPrivateKey,
    );

    const feePayerKeyring = this.caver.klay.accounts.createWithAccountKey(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    // Add a keyring login snder address to caver.wallet
    this.caver.klay.accounts.wallet.add(senderKeyring);
    // Add a keyring login fee payer address to caver.wallet
    this.caver.klay.accounts.wallet.add(feePayerKeyring);

    const price = await this.contract?.methods._tokenPrice(tokenId).call();

    // using the promise
    const signedTx: any = await this.caver.klay.accounts.signTransaction(
      {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: senderKeyring.address,
        to: DEPLOYED_ADDRESS,
        data: this.contract?.methods.purchaseToken(tokenId).encodeABI(),
        gas: '500000',
        value: price,
      },
      senderKeyring.privateKey,
    );

    const { rawTransaction } = signedTx;

    const tx = await this.caver.klay.sendTransaction({
      senderRawTransaction: rawTransaction,
      feePayer: feePayerKeyring.address,
    });

    // in-memory wallet 에서 계정 정보 삭제
    this.caver.klay.accounts.wallet.clear();

    return {
      ...tx,
    };
  }

  async sellToken(
    tokenId: number,
    amount: string | number,
    ownerAddress: string,
    ownerPrivateKey: string,
  ) {
    const senderKeyring = this.caver.klay.accounts.createWithAccountKey(
      ownerAddress,
      ownerPrivateKey,
    );

    const feePayerKeyring = this.caver.klay.accounts.createWithAccountKey(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    // Add a keyring login snder address to caver.wallet
    this.caver.klay.accounts.wallet.add(senderKeyring);
    // Add a keyring login fee payer address to caver.wallet
    this.caver.klay.accounts.wallet.add(feePayerKeyring);

    const signedTx: any = await this.caver.klay.accounts.signTransaction(
      {
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: senderKeyring.address,
        to: DEPLOYED_ADDRESS,
        data: this.contract?.methods
          .setForSale(tokenId, this.caver.utils.toPeb(amount, 'KLAY'))
          .encodeABI(),
        gas: '500000',
      },
      senderKeyring.privateKey,
    );

    const { rawTransaction } = signedTx;

    const tx = await this.caver.klay.sendTransaction({
      senderRawTransaction: rawTransaction,
      feePayer: feePayerKeyring.address,
    });

    // in-memory wallet 에서 계정 정보 삭제
    this.caver.klay.accounts.wallet.clear();

    return {
      ...tx,
    };
  }

  /**
   * @description 소유권 이전
   * @param tokenId
   * @param ownerAddress
   * @param ownerPrivateKey
   * @param buyerAddress
   * @param buyerPrivateKey
   */
  async transferOwnership(
    tokenId: number,
    ownerAddress: string,
    ownerPrivateKey: string,
    buyerAddress: string,
    buyerPrivateKey: string,
  ) {
    const senderKeyring = this.caver.klay.accounts.createWithAccountKey(
      ownerAddress,
      ownerPrivateKey,
    );

    const buyerKeyring = this.caver.klay.accounts.createWithAccountKey(
      buyerAddress,
      buyerPrivateKey,
    );

    // Add a keyring login snder address to caver.wallet
    this.caver.klay.accounts.wallet.add(senderKeyring);
    // Add a keyring login buyer address to caver.wallet
    this.caver.klay.accounts.wallet.add(buyerKeyring);

    const receipt = await this.contract?.send(
      {
        from: senderKeyring.address,
        gas: GAS,
      },
      'transferOwnership',
      tokenId,
      buyerKeyring.address,
    );

    // in-memory wallet 에서 계정 정보 삭제
    this.caver.klay.accounts.wallet.clear();

    return receipt;
  }
}

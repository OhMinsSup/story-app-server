import { Inject, Injectable, Logger } from '@nestjs/common';
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

interface MintingParams {
  address: string;
  privateKey: string;
  id: number;
}

interface TransferParams {
  tokenId: number;
  ownerAddress: string;
  ownerPrivateKey: string;
  buyerAddress: string;
  buyerPrivateKey: string;
}

@Injectable()
export class KlaytnService {
  private contract: Contract | null;
  private readonly logger = new Logger(KlaytnService.name);

  constructor(
    @Inject(KLAYTN) private readonly caver: Caver,
    @Inject(FEE_PAYER_WALLET)
    private readonly feePayerWallet: KlaytnModuleOptions,
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
   * @description caver.rpc는 Klaytn 노드에 RPC 호출을 하는 기능을 제공하는 패키지입니다.
   */
  get rpc() {
    return this.caver.rpc;
  }

  /**
   * @description Keyring은 Klaytn 계정의 주소와 개인 키를 포함하는 구조입니다. */
  keyring() {
    const randomHex = this.caver.utils.randomHex(32);
    return this.wallet.keyring.generate(randomHex);
  }

  /**
   * @description SingleKeyring은 개인 키를 가지고 있는 키링 패키지입니다.
   * @param address
   * @param privateKey
   */
  singleKeyring(address: string, privateKey: string) {
    return this.wallet.newKeyring(address, privateKey);
  }

  /**
   * @description 주어진 주소가 올바른 주소인지 체크
   * @param address
   */
  isAddress(address: string) {
    return this.caver.utils.isAddress(address);
  }

  /**
   * @description minting 생성
   * @param {MintingParams} params
   */
  async minting(params: MintingParams) {
    const senderSingle = this.singleKeyring(params.address, params.privateKey);

    const feePayerSingle = this.singleKeyring(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    const signed: any = await this.contract.sign(
      {
        from: senderSingle.address,
        feeDelegation: true,
        gas: GAS,
      },
      'mintStory',
      params.id,
    );

    await this.wallet.signAsFeePayer(feePayerSingle.address, signed);

    const receipt = await this.rpc.klay.sendRawTransaction(signed);

    const tokenId = await this.contract.call('getTotalCount');

    const result = {
      tokenId,
      ...receipt,
    };

    this.logger.debug({
      message: 'Minting',
      payload: result,
    });

    return result;
  }

  /**
   * @description 소유권 이전
   * @param {TransferParams} params
   */
  async transferOwnership(params: TransferParams) {
    const senderSingle = this.singleKeyring(
      params.ownerAddress,
      params.ownerPrivateKey,
    );

    const buyerSingle = this.singleKeyring(
      params.buyerAddress,
      params.buyerPrivateKey,
    );

    const feePayerSingle = this.singleKeyring(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    const signed: any = await this.contract.sign(
      {
        from: senderSingle.address,
        feeDelegation: true,
        gas: GAS,
      },
      'transferOwnership',
      params.tokenId,
      buyerSingle.address,
    );

    await this.wallet.signAsFeePayer(feePayerSingle.address, signed);

    const receipt = await this.rpc.klay.sendRawTransaction(signed);

    const result = {
      tokenId: params.tokenId,
      ...receipt,
    };

    this.logger.debug({
      message: 'transferOwnership',
      payload: result,
    });

    return receipt;
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
}

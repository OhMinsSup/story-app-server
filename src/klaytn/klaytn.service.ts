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

interface Account {
  address: string;
  privateKey: string;
}

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

interface BuyNSellerParams {
  tokenId: number;
  price: string | number;
  owner: Account;
}

interface CancelParams {
  tokenId: number;
  owner: Account;
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
   * @description 모든 KLAY 단위를 보여줍니다. */
  klayUnit() {
    return this.caver.utils.klayUnit;
  }

  /**
   * @description tokenId에 해당하는 가격이 있는지 확인
   * @param tokenId
   */
  async tokenPrice(tokenId: number) {
    const tokenPrice = await this.contract.call('_tokenPrice', tokenId);
    return tokenPrice;
  }

  /**
   * @description tokenId에 해당하는 NFT 정보를 가져온다
   * @param tokenId
   */
  async getStory(tokenId: number) {
    const story = await this.contract.call('getStory', tokenId);
    return story;
  }

  /**
   * @description 판매 취소를 한다
   * @param {BuyNSellerParams} params
   */
  async cancel(params: CancelParams) {
    const ownerKeyring = this.singleKeyring(
      params.owner.address,
      params.owner.privateKey,
    );

    const feePayerSingle = this.singleKeyring(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    const receipt = await this.contract.send(
      {
        from: ownerKeyring.address,
        gas: GAS,
        feeDelegation: true,
        feePayer: feePayerSingle.address,
      },
      'removeTokenOnSale',
      [params.tokenId],
    );

    this.logger.debug({
      message: 'cancel',
      payload: receipt,
    });

    return receipt;
  }

  /**
   * @description 판매를 한다
   * @param {BuyNSellerParams} params
   */
  async seller(params: BuyNSellerParams, utils: string) {
    const ownerKeyring = this.singleKeyring(
      params.owner.address,
      params.owner.privateKey,
    );

    const feePayerSingle = this.singleKeyring(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    /**
     * @link https://forum.klaytn.com/t/setapprovalforall/3552/4
     * @description 호출한 NFT 토큰 Owner는 자신이 보유한 모든 NFT토큰에 대해 Operator가 전송 권한을 갖게 할 수 있습니다.
     * _approved 변수에 true를 입력하면 모든 토큰에 대한 전송 권한을 갖게,
     * false를 입력하면 모든 토큰에 대한 전송 권한을 취소하게 됩니다.
     */
    await this.contract.send(
      {
        from: ownerKeyring.address,
        gas: GAS,
        feeDelegation: true,
        feePayer: feePayerSingle.address,
      },
      'setApprovalForAll',
      DEPLOYED_ADDRESS,
      true,
    );

    const price = this.caver.utils
      .toBN(this.caver.utils.convertToPeb(params.price, utils).toString())
      .toNumber();

    const receipt = await this.contract.send(
      {
        from: ownerKeyring.address,
        gas: GAS,
        feeDelegation: true,
        feePayer: feePayerSingle.address,
      },
      'setForSale',
      params.tokenId,
      price,
    );

    this.logger.debug({
      message: 'seller',
      payload: receipt,
    });

    return receipt;
  }

  /**
   * @description 구매를 한다
   * @param {BuyNSellerParams} params
   */
  async buy(params: BuyNSellerParams, utils: string) {
    const ownerKeyring = this.singleKeyring(
      params.owner.address,
      params.owner.privateKey,
    );

    const feePayerSingle = this.singleKeyring(
      this.feePayerWallet.feePayerAddress,
      this.feePayerWallet.feePayerPrivateKey,
    );

    const tokenPrice = await this.tokenPrice(params.tokenId);

    const price = this.caver.utils.convertToPeb(tokenPrice, utils);

    const receipt = await this.contract.send(
      {
        from: ownerKeyring.address,
        gas: GAS,
        feeDelegation: true,
        feePayer: feePayerSingle.address,
        value: price,
      } as Record<string, any>,
      'purchaseToken',
      params.tokenId,
    );

    this.logger.debug({
      message: 'buy',
      payload: receipt,
    });

    return receipt;
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

    const signed: Awaited<any> = await this.contract.sign(
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
}

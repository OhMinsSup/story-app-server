import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { IpfsService } from '../ipfs/ipfs.service';
import { KlaytnService } from '../klaytn/klaytn.service';

import { QUEUE_CONSTANTS, TASK_CONSTANTS } from '../../constants/config';
import { isNumber } from '../../libs/assertion';

// types
import type { QueueJobData } from './queue.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.MINTING)
    private readonly mintingQueue: Queue<Record<string, any>>,
    private readonly prisma: PrismaService,
    private readonly klaytn: KlaytnService,
    private readonly nftClient: IpfsService,
  ) {}

  private async _addJob(itemId: number, data: QueueJobData): Promise<Job> {
    return await this.mintingQueue.add(TASK_CONSTANTS.MINTING, {
      itemId,
      data,
    });
  }

  async generateNft(itemId: number, data: QueueJobData) {
    try {
      const wallet = await this.prisma.userWallet.findFirst({
        where: {
          address: data.user.wallet.address,
        },
        select: {
          privateKey: true,
        },
      });

      const metadata = await this.nftClient.add(data);

      const { receipt, tokenId } = await this.klaytn.mint(
        wallet.privateKey,
        itemId,
        metadata.url,
      );
      if (tokenId) {
        const nft = await this.prisma.nFT.create({
          data: {
            tokenId: isNumber(tokenId) ? tokenId.toString() : tokenId,
            cid: metadata.ipnft,
            ipfsUrl: metadata.url,
          },
        });
        await this.prisma.transactionReceipt.create({
          data: {
            transactionHash: receipt.transactionHash,
            nftId: nft.id,
          },
        });
        await this.prisma.item.update({
          where: {
            id: itemId,
          },
          data: {
            nftId: nft.id,
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async minting(itemId: number, data: QueueJobData): Promise<Job> {
    return await this._addJob(itemId, data);
  }
}

import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';

import { QUEUE_CONSTANTS, TASK_CONSTANTS } from '../../constants/config';

// types
import type { QueueJobData } from './queue.interface';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_CONSTANTS.MINTING)
    private readonly mintingQueue: Queue<Record<string, any>>,
  ) {}

  private async _addJob(itemId: number, data: QueueJobData): Promise<Job> {
    return await this.mintingQueue.add(TASK_CONSTANTS.MINTING, {
      itemId,
      data,
    });
  }

  async minting(itemIds: number[], data: QueueJobData): Promise<Job[]> {
    const jobs: Job[] = [];
    await Promise.all(
      itemIds.map(async (itemId) => {
        const job = await this._addJob(itemId, data);
        jobs.push(job);
      }),
    );
    return jobs;
  }
}

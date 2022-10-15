import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_CONSTANTS, TASK_CONSTANTS } from '../../constants/config';
import { QueueService } from './queue.service';

@Processor(QUEUE_CONSTANTS.MINT)
export class MintConsumer {
  private readonly logger = new Logger(MintConsumer.name);

  constructor(private readonly service: QueueService) {}

  @Process(TASK_CONSTANTS.MINT)
  async popMint(job: Job<Record<string, any>>): Promise<any> {
    const { itemId, data } = job.data;
    return {
      itemId,
      data,
    };
  }
}

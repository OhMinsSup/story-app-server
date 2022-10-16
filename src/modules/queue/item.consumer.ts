import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_CONSTANTS, TASK_CONSTANTS } from '../../constants/config';
import { QueueService } from './queue.service';

@Processor(QUEUE_CONSTANTS.ITEM)
export class ItemConsumer {
  private readonly logger = new Logger(ItemConsumer.name);

  constructor(private readonly service: QueueService) {}

  @Process(TASK_CONSTANTS.ITEM)
  async popItem(job: Job<Record<string, any>>): Promise<any> {
    const { itemId, data } = job.data;
    const success = await this.service.generateNft(itemId, data);
    return {
      success,
    };
  }
}

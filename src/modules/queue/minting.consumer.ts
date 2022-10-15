import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { QUEUE_CONSTANTS, TASK_CONSTANTS } from '../../constants/config';

@Processor(QUEUE_CONSTANTS.MINTING)
export class MintingConsumer {
  private readonly logger = new Logger(MintingConsumer.name);

  constructor(
    @InjectQueue(QUEUE_CONSTANTS.MINT)
    private readonly mintQueue: Queue<Record<string, any>>,
  ) {}

  @Process(TASK_CONSTANTS.MINTING)
  async popTaskByMinting(job: Job<Record<string, any>>) {
    const { itemId, data } = job.data;
    return this.mintQueue.add(TASK_CONSTANTS.MINT, {
      itemId,
      data,
    });
  }
}

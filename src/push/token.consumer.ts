import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { QUEUE_CONSTANTS, TASK_CONSTANTS } from 'src/common/common.constants';

@Processor(QUEUE_CONSTANTS.TOKEN)
export class TokenConsumer {
  private readonly logger = new Logger(TokenConsumer.name);

  constructor(
    @InjectQueue(QUEUE_CONSTANTS.MESSAGE)
    private readonly messageQueue: Queue<Record<string, any>>,
  ) {}

  @Process(TASK_CONSTANTS.TOKEN_BULK)
  async popTaskByBulkToken(job: Job<Record<string, any>>) {
    const { tokens, option } = job.data;
    return this.pushBulkMessage({
      tokens,
      title: option.title,
      body: option.body,
    });
  }

  private pushBulkMessage(payload: Record<string, any>) {
    this.logger.debug({
      message: 'push bulk message',
      payload,
    });

    return this.messageQueue.add(TASK_CONSTANTS.MESSAGE_BULK, {
      message: {
        tokens: payload.tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: './images/android-chrome-192x192.png',
        },
      },
    });
  }
}

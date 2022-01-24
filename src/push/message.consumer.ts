import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { QUEUE_CONSTANTS, TASK_CONSTANTS } from 'src/common/common.constants';
import { PushService } from './push.service';

@Processor(QUEUE_CONSTANTS.MESSAGE)
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);

  constructor(private readonly pushService: PushService) {}

  @Process(TASK_CONSTANTS.MESSAGE_BULK)
  async popBulkMessage(job: Job<Record<string, any>>): Promise<any> {
    const { message } = job.data;

    this.logger.debug({
      message: 'pop bulk message',
      payload: message,
    });

    const result = await this.pushService.sendNotification(message.tokens, {
      notification: {
        title: message.notification.title,
        body: message.notification.body,
        icon: message.notification.imageUrl,
      },
    });

    this.logger.debug({
      message: 'result bulk message',
      payload: result,
    });

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }
}

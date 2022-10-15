import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { QueueService } from './modules/queue/queue.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

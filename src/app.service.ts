import { Injectable } from '@nestjs/common';
import { QueueService } from './modules/queue/queue.service';

@Injectable()
export class AppService {
  constructor(private readonly queue: QueueService) {}
  getHello(): string {
    this.queue.minting([1], {
      name: 'deno',
      description: 'A modern runtime for JavaScript and TypeScript',
      thumbnailUrl: 'https://deno.land/',
      contentUrl: 'https://deno.land/',
      tags: ['deno', 'runtime', 'typescript'],
      price: 1,
      backgroundColor: '#ffffff',
      externalSite: 'https://deno.land/',
    });
    return 'Hello World!';
  }
}

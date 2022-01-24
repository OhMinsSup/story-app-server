import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import * as firebaseAdmin from 'firebase-admin';

import {
  PUSH_OPITIONS,
  QUEUE_CONSTANTS,
  TASK_CONSTANTS,
} from 'src/common/common.constants';

import type { PushModuleOptions } from './push.interface';

@Injectable()
export class PushService {
  constructor(
    @Inject(PUSH_OPITIONS)
    private readonly pushOptions: PushModuleOptions,
    @InjectQueue(QUEUE_CONSTANTS.TOKEN)
    private readonly tokenQueue: Queue<Record<string, any>>,
  ) {
    if (firebaseAdmin.apps.length === 0) {
      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(
          this.pushOptions.firebaseSpecsPath,
        ),
      });
    }
  }

  private readonly options = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
  };

  private readonly optionsSilent = {
    priority: 'high',
    timeToLive: 60 * 60 * 24,
    content_available: true,
  };

  private async addJob(
    token: string,
    option: Record<string, any>,
  ): Promise<Job> {
    return await this.tokenQueue.add(TASK_CONSTANTS.TOKEN_ONE, {
      token,
      option,
    });
  }

  private async addBulkJob(
    tokens: string[],
    option: Record<string, any>,
  ): Promise<Job[]> {
    const jobs = {
      name: TASK_CONSTANTS.TOKEN_BULK,
      data: {
        tokens,
        option,
      },
    };

    return await this.tokenQueue.addBulk([jobs]);
  }

  async pushMessage(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<Job[]> {
    const jobs: Job[] = [];
    await Promise.all(
      tokens.map(async (token) => {
        const job = await this.addJob(token, {
          title,
          body,
        });
        jobs.push(job);
      }),
    );
    return jobs;
  }

  async pushBulkMessage(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<Job[]> {
    return await this.addBulkJob(tokens, {
      title,
      body,
    });
  }

  async sendNotification(
    deviceIds: string[],
    payload: firebaseAdmin.messaging.MessagingPayload,
    silent?: boolean,
  ) {
    if (deviceIds.length == 0) {
      throw new Error('You provide an empty device ids list!');
    }

    const result = await firebaseAdmin
      .messaging()
      .sendToDevice(
        deviceIds,
        payload,
        silent ? this.optionsSilent : this.options,
      );

    return result;
  }

  async sendMulticast(message: firebaseAdmin.messaging.MulticastMessage) {
    if (message.tokens.length === 0) {
      throw new Error('You provide an empty device ids list!');
    }

    const result = await firebaseAdmin.messaging().sendMulticast(message);
    return result;
  }
}

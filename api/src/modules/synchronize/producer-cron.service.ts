import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CRON_SYNCHRONIZATION_QUEUE } from './synchronize.constants';

export type CronSynchronizeJob = Record<string, unknown>;

@Injectable()
export class ProducerCronService {
  constructor(
    @InjectQueue(CRON_SYNCHRONIZATION_QUEUE)
    cronSynchronizationQueue: Queue<CronSynchronizeJob>,
  ) {
    cronSynchronizationQueue
      .add(
        {},
        {
          repeat: {
            cron: '0 0 * * *',
          },
        },
      )
      .then(() => console.log('youpi'))
      .catch((e) => console.log('aie : ', e));
  }
}

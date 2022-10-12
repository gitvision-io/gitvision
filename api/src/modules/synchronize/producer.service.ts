import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { timeStamp } from 'console';

export interface SynchronizeJob {
  organization: string;
  repositories?: string[];

  // ISO Datetime
  fromDate?: string;

  // ISO Datetime
  toDate?: string;
}

@Injectable()
export class ProducerService {
  constructor(
    @InjectQueue('sync-organization')
    private synchronizationQueue: Queue<SynchronizeJob>,
  ) {}

  async addJob(job: SynchronizeJob): Promise<Job<SynchronizeJob>> {
    const now = new Date();
    const defaultFromDate = new Date(now.getTime());
    defaultFromDate.setMonth(now.getMonth() - 6);

    const defaults = {
      fromDate: defaultFromDate.toISOString(),
      toDate: now.toISOString(),
    };

    const actives = await this.synchronizationQueue.getActive();
    const waitings = await this.synchronizationQueue.getWaiting();

    if (
      [...actives, ...waitings].some(
        (j) => j.data.organization === job.organization,
      )
    ) {
      console.log('has active, cancelling');
    }

    const consolidatedJob: SynchronizeJob = { ...defaults, ...job };
    return await this.synchronizationQueue.add(consolidatedJob);
  }
}

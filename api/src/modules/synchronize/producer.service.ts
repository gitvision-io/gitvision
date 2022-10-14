import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface SynchronizeJob {
  organization: string;
  repositories?: string[];

  // ISO Datetime
  fromDate?: string;

  githubToken: string;
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
    };

    const actives = await this.synchronizationQueue.getActive();
    const waitings = await this.synchronizationQueue.getWaiting();

    if (
      [...actives, ...waitings].some(
        (j) =>
          j.data.organization === job.organization &&
          j.data.repositories.every((r) => job.repositories.includes(r)) &&
          job.repositories.every((r) => j.data.repositories.includes(r)),
      )
    ) {
      console.log('has active, cancelling');
    }

    const consolidatedJob: SynchronizeJob = { ...defaults, ...job };
    return await this.synchronizationQueue.add(consolidatedJob);
  }
}

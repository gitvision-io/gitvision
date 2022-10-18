import { Injectable } from '@nestjs/common';
import Bull, { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

export interface SynchronizeJob {
  fromDate: string;
  userId: string;
}

@Injectable()
export class ProducerService {
  constructor(
    @InjectQueue('sync-organization')
    private synchronizationQueue: Queue<SynchronizeJob>,
  ) {}

  async getJob(jobId: Bull.JobId) {
    return await this.synchronizationQueue.getJob(jobId);
  }

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
        (j) => j.data.fromDate === job.fromDate && j.data.userId === job.userId,
      )
    ) {
      console.log('has active, cancelling');
    }

    const consolidatedJob: SynchronizeJob = { ...defaults, ...job };
    return await this.synchronizationQueue.add(consolidatedJob);
  }
}

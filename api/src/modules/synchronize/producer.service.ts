import { Injectable } from '@nestjs/common';
import Bull, { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { USER_SYNCHRONIZATION_QUEUE } from './synchronize.constants';

export interface UserSynchronizeJob {
  fromDate: string;
  userId: string;
}

@Injectable()
export class ProducerService {
  constructor(
    @InjectQueue(USER_SYNCHRONIZATION_QUEUE)
    private userSynchronizationQueue: Queue<UserSynchronizeJob>,
  ) {}

  async getJob(jobId: Bull.JobId) {
    return await this.userSynchronizationQueue.getJob(jobId);
  }

  async addJob(job: UserSynchronizeJob): Promise<Job<UserSynchronizeJob>> {
    const now = new Date();
    const defaultFromDate = new Date(now.getTime());
    defaultFromDate.setMonth(now.getMonth() - 6);

    const defaults = {
      fromDate: defaultFromDate.toISOString(),
    };

    const actives = await this.userSynchronizationQueue.getActive();
    const waitings = await this.userSynchronizationQueue.getWaiting();

    if (
      [...actives, ...waitings].some(
        (j) => j.data.fromDate === job.fromDate && j.data.userId === job.userId,
      )
    ) {
      console.log('has active, cancelling');
    }

    const consolidatedJob: UserSynchronizeJob = { ...defaults, ...job };
    return await this.userSynchronizationQueue.add(consolidatedJob);
  }
}

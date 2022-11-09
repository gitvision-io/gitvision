import { Injectable } from '@nestjs/common';
import Bull, { Job, Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { USER_SYNCHRONIZATION_QUEUE } from './synchronize.constants';
import { Organization } from 'src/common/types';
import { Repo } from 'src/entities/repo.entity';
export interface SynchronizeJob {
  fromDate: string;
  orgs: Organization[];
  repos: Repo[];
  gitProviderName: string;
  gitProviderToken?: string;
}
export interface UserSynchronizeJob extends SynchronizeJob {
  userId: string;
}

@Injectable()
export class ProducerService<T extends SynchronizeJob> {
  constructor(
    @InjectQueue(USER_SYNCHRONIZATION_QUEUE)
    protected readonly synchronizationQueue: Queue<T>,
  ) {}

  async getJob(jobId: Bull.JobId) {
    return await this.synchronizationQueue.getJob(jobId);
  }

  async addJob(job: T): Promise<Job<T>> {
    const now = new Date();
    const defaultFromDate = new Date(now.getTime());
    defaultFromDate.setMonth(now.getMonth() - 6);

    const defaults = {
      fromDate: defaultFromDate.toISOString(),
    };

    const actives = await this.synchronizationQueue.getActive();
    const waitings = await this.synchronizationQueue.getWaiting();

    const existingJob = [...actives, ...waitings].find((j) =>
      Object.entries(j).every(([k, v]) => v === job[k]),
    );
    if (existingJob) {
      console.log('has active, cancelling');
      return existingJob;
    }

    const consolidatedJob: T = { ...defaults, ...job };
    return await this.synchronizationQueue.add(consolidatedJob);
  }
}

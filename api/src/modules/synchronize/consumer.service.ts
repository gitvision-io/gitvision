import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { UsersService } from '../users/users.service';
import { SynchronizeJob } from './producer.service';
import { SynchronizeService } from './synchronize.service';

@Processor('sync-organization')
export class ConsumerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly synchronizeService: SynchronizeService,
  ) {}

  @Process()
  async transcode(job: Job<SynchronizeJob>): Promise<void> {
    const user = await this.usersService.findOne(job.data.userId);
    this.synchronizeService.auth(user.githubToken);

    const now = new Date();
    const synchronizationDate = new Date(job.data.fromDate);

    await this.synchronizeService.synchronize(synchronizationDate);
    await this.usersService.update(user.id, {
      lastSynchronize: now,
    });
  }
}

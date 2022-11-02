import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { UsersService } from '../users/users.service';
import { UserSynchronizeJob } from './producer.service';
import { USER_SYNCHRONIZATION_QUEUE } from './synchronize.constants';
import { SynchronizeService } from './synchronize.service';

@Processor(USER_SYNCHRONIZATION_QUEUE)
export class ConsumerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly synchronizeService: SynchronizeService,
  ) {}

  @Process()
  async transcode(job: Job<UserSynchronizeJob>): Promise<void> {
    const user = await this.usersService.findOne(job.data.userId);
    this.synchronizeService.auth(user.gitProviderName, user.gitProviderToken);

    const now = new Date();
    const synchronizationDate = new Date(job.data.fromDate);

    console.log('youpi 1 : synchronizing');
    await this.synchronizeService.synchronize(synchronizationDate);
    await this.usersService.update(user.id, {
      lastSynchronize: now,
    });
  }
}

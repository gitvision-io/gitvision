import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { UserSynchronizeJob } from './producer.service';
import { USER_SYNCHRONIZATION_QUEUE } from './synchronize.constants';
import { SynchronizeService } from './synchronize.service';

@Processor(USER_SYNCHRONIZATION_QUEUE)
export class ConsumerService {
  constructor(
    private readonly usersService: UsersService,
    private readonly synchronizeService: SynchronizeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Process()
  async transcode(job: Job<UserSynchronizeJob>): Promise<void> {
    const user = await this.usersService.findOne(job.data.userId);
    this.notificationsService.setCurrentUser(user);
    this.synchronizeService.auth(
      job.data.gitProviderName,
      job.data.gitProviderToken,
    );
    const now = new Date();
    const synchronizationDate = new Date(job.data.fromDate);

    try {
      await job.progress(5);
      await this.synchronizeService.synchronize(synchronizationDate, job);

      await job.progress(95);
      await this.usersService.update(user.id, {
        lastSynchronize: now,
      });

      await this.notificationsService.notify({
        event: 'synchronize_job_ended',
        data: {
          jobId: job.id,
        },
      });
    } catch (e) {
      console.log(e);
      await this.notificationsService.notify({
        event: 'synchronize_job_error',
        data: {
          jobId: job.id,
          errorMessage: e.message,
          errorStack: e.stack,
        },
      });
    }
  }
}

import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PromisePool } from '@supercharge/promise-pool';
import { UsersService } from '../users/users.service';
import { CronSynchronizeJob } from './producer-cron.service';
import { CRON_SYNCHRONIZATION_QUEUE } from './synchronize.constants';
import { SynchronizeService } from './synchronize.service';

interface CronSynchronizationResult {
  nbUsersSynchronized: number;
}

@Processor(CRON_SYNCHRONIZATION_QUEUE)
export class ConsumerCronService {
  constructor(
    private readonly usersService: UsersService,
    private readonly synchronizeService: SynchronizeService,
  ) {}

  @Process()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transcode(
    _job: Job<CronSynchronizeJob>,
  ): Promise<CronSynchronizationResult> {
    const maxSynchronizeDate = new Date();
    maxSynchronizeDate.setHours(maxSynchronizeDate.getHours() - 23);
    const users = await this.usersService.findAll(maxSynchronizeDate);

    const { errors } = await PromisePool.withConcurrency(20)
      .for(users)
      .process(async (user) => {
        this.synchronizeService.auth(
          user.gitProviderName,
          user.gitProviderToken,
        );

        const now = new Date();
        const synchronizationDate = new Date(user.lastSynchronize);

        await this.synchronizeService.synchronize(synchronizationDate);
        await this.usersService.update(user.id, {
          lastSynchronize: now,
        });
      });

    errors.forEach((e) =>
      console.error(
        `error occured when synchronizing user ${e.item.id}: ${e.message}. Stack trace: ${e.stack}`,
      ),
    );
    return {
      nbUsersSynchronized: users.length,
    };
  }
}

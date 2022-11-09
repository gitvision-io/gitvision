import { Controller, Get, Param, Post } from '@nestjs/common';
import { Job } from 'bull';
import { User } from 'src/entities/user.entity';
import { GitProviderService } from '../git-provider/gitprovider.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ProducerService,
  UserSynchronizeJob,
} from '../synchronize/producer.service';
import { USER } from '../users/users.decorator';

@Controller('/api/synchronize')
export class SynchronizeController {
  constructor(
    private readonly synchronizeProducerService: ProducerService<UserSynchronizeJob>,
    private readonly notificationsService: NotificationsService,
    private readonly gitProviderService: GitProviderService,
  ) {}

  @Get('jobs/:id')
  async getSynchronizationJob(
    @Param('id') id: string,
  ): Promise<Job<UserSynchronizeJob>> {
    return await this.synchronizeProducerService.getJob(id);
  }

  @Post('jobs')
  async createSynchronizationJob(
    @USER() user: User,
  ): Promise<Job<UserSynchronizeJob>> {
    let date: Date;
    if (!user.lastSynchronize) {
      date = new Date();
      date.setMonth(date.getMonth() - 6);
    } else {
      date = user.lastSynchronize;
    }

    const orgs = await this.gitProviderService.getAllOrgs();
    const job = await this.synchronizeProducerService.addJob({
      userId: user.id,
      orgs,
      repos: user.repos,
      fromDate: date.toISOString(),
      gitProviderName: user.gitProviderName,
      gitProviderToken: user.gitProviderToken,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await this.notificationsService.notify({
      event: 'synchronize_job_created',
      data: {
        jobId: job.id,
      },
    });

    return job;
  }
}

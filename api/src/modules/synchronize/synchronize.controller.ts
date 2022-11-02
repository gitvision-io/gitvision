import { Controller, Get, Param, Post } from '@nestjs/common';
import { Job } from 'bull';
import { User } from 'src/entities/user.entity';
import {
  ProducerService,
  UserSynchronizeJob,
} from '../synchronize/producer.service';
import { USER } from '../users/users.decorator';

@Controller('/api/synchronize')
export class SynchronizeController {
  constructor(private readonly synchronizeProducerService: ProducerService) {}

  @Get('jobs/:id')
  async getAllRepoStat(@Param('id') id: string): Promise<Job<UserSynchronizeJob>> {
    return await this.synchronizeProducerService.getJob(id);
  }

  @Post('jobs')
  async getAllRepoStatOfAllOrg(
    @USER() user: User,
  ): Promise<Job<UserSynchronizeJob>> {
    let date: Date;
    if (!user.lastSynchronize) {
      date = new Date();
      date.setMonth(date.getMonth() - 6);
    } else {
      date = user.lastSynchronize;
    }

    const job = await this.synchronizeProducerService.addJob({
      userId: user.id,
      fromDate: date.toISOString(),
    });

    return job;
  }
}

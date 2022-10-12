import { Controller, Get, Query } from '@nestjs/common';
import { ProducerService } from '../synchronize/producer.service';
import { DashboardService } from './dashboard.service';

interface Filters {
  organization?: string;
  time?: string;
  repositories?: string[];
}

@Controller('/api/dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly synchronizeProducerService: ProducerService,
  ) {}

  @Get('analytics')
  async getAnalytics(@Query('filters') filters: Filters): Promise<any> {
    await this.synchronizeProducerService.addJob({
      organization: filters.organization,
      repositories: filters.repositories,
    });
    return 'ok';
  }
}

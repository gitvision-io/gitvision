import { Controller, Get, Query } from '@nestjs/common';
import { GithubService } from '../github/github.service';
import { ProducerService } from '../synchronize/producer.service';
import { DashboardService } from './dashboard.service';

interface Filters {
  organization?: string;
  time?: string;
  repositories?: string[];
}

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('analytics')
  async getAnalytics(@Query('filters') filters: Filters): Promise<any> {
    return 'ok';
  }
}

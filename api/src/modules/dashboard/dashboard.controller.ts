import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

interface Filters {
  organization?: number;
  time?: string;
  repositories?: number[];
}

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('analytics')
  async getAnalytics(@Query('filters') filters: Filters): Promise<any> {
    return 'ok';
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('orgs')
  async getOrgs(): Promise<{ id: number; login: string }[]> {
    return await this.dashboardService.getOrgs();
  }

  @Get('orgs/:org/repos')
  async getOrgRepositories(
    @Param('org') org: string,
  ): Promise<{ id: number; name: string }[]> {
    return await this.dashboardService.getRepositories(org, 'public');
  }
}

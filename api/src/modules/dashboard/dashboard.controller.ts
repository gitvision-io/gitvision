import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('orgs')
  async getAllOrganizations(): Promise<{ id: string; login: string }[]> {
    return await this.dashboardService.getAllOrganizations();
  }

  @Get('orgs/:org/repos')
  async getOrgRepositories(
    @Param('org') org: string,
  ): Promise<{ id: string; name: string }[]> {
    return await this.dashboardService.getAllRepositories(org, 'public');
  }
}

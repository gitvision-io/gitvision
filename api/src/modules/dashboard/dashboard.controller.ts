import { Controller, Get, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('/api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('orgs')
  async getOrgs(): Promise<{ id: number; login: string; isMain: boolean }[]> {
    const orgs = await this.dashboardService.getOrgs();
    const profile = await this.dashboardService.getProfile();
    return [
      { ...profile, isMain: true },
      ...orgs.map((o) => ({ ...o, isMain: false })),
    ];
  }

  @Get('repos')
  async getMainRepositories(): Promise<{ id: number; name: string }[]> {
    return await this.dashboardService.getRepositories('all');
  }

  @Get('orgs/:org/repos')
  async getOrgRepositories(
    @Param('org') org: string,
  ): Promise<{ id: number; name: string }[]> {
    return await this.dashboardService.getOrgRepositories(org, 'public');
  }
}

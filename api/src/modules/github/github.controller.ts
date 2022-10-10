import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('/api/github')
export class GithubController {
  constructor(private readonly dashboardService: GithubService) {}

  @Get('orgs')
  async getOrgs(): Promise<{ id: number; login: string; isMain: boolean }[]> {
    const orgs = await this.dashboardService.getAllOrganizations();
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

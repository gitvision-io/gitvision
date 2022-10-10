import { Controller, Get, Param } from '@nestjs/common';
import { GithubService } from './github.service';

@Controller('/api/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('orgs')
  async getOrgs(): Promise<{ id: number; login: string; isUser: boolean }[]> {
    const orgs = await this.githubService.getAllOrganizations();
    const profile = await this.githubService.getProfile();
    return [
      { ...profile, isUser: true },
      ...orgs.map((o) => ({ ...o, isUser: false })),
    ];
  }

  @Get('repos')
  async getMainRepositories(): Promise<{ id: string; name: string }[]> {
    return await this.githubService.getRepositories('all');
  }

  @Get('orgs/:org/repos')
  async getOrgRepositories(
    @Param('org') org: string,
  ): Promise<{ id: string; name: string; branches: { name: string }[] }[]> {
    return await this.githubService.getOrgRepositories(org, 'public');
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { USER } from '../users/users.decorator';
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
  async getMainRepositories(
    @USER() user: User,
  ): Promise<{ id: string; name: string }[]> {
    const repos = await this.githubService.getRepositories('all');
    return repos;
  }

  @Get('orgs/:org/repos')
  async getOrgRepositories(
    @Param('org') org: string,
  ): Promise<{ id: string; name: string; branches: { name: string }[] }[]> {
    return await this.githubService.getOrgRepositories(org, 'public');
  }
}

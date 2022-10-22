import { Controller, Get, Param } from '@nestjs/common';
import { User } from '@octokit/graphql-schema';
import { GithubService } from '../github/github.service';
import { USER } from '../users/users.decorator';
import { RepoService } from './repo.service';

@Controller('/api/orgs')
export class OrgsController {
  constructor(
    private readonly repoService: RepoService,
    private readonly githubService: GithubService,
  ) {}

  @Get('')
  async getOrgs(
    @USER() user: User,
  ): Promise<{ login: string; isUser: boolean }[]> {
    const orgs = await this.repoService.getAllOrganizations(user.id);
    const profile = await this.githubService.getProfile();
    return [
      { ...profile, isUser: true },
      ...orgs.map((o) => ({ login: o, isUser: false })),
    ];
  }

  @Get(':org/repos')
  async getOrgRepositories(
    @USER() user: User,
    @Param('org') org: string,
  ): Promise<string[]> {
    return await this.repoService.getRepositories(
      user.id,
      org === 'user' ? null : org,
    );
  }
}

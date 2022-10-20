import { Controller, Get, Param, Query } from '@nestjs/common';
import { User } from '@octokit/graphql-schema';
import { Repo } from 'src/entities/repo.entity';
import { USER } from '../users/users.decorator';
import { RepoService } from './repo.service';

@Controller('/api/orgstats')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @Get('/')
  async getAllRepoStat(): Promise<Repo[]> {
    return await this.repoService.findAll();
  }

  @Get(':org')
  async getRepoStat(
    @USER() user: User,
    @Param('org') org: string,
    @Query('filters') { repositories, time },
  ): Promise<Repo[]> {
    return await this.repoService.findByOrgByReposAndTime(
      user.id,
      org === 'user' ? null : org,
      repositories,
      time,
    );
  }
}

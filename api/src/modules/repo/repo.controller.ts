import { Controller, Get, Param, Query } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { RepoService } from './repo.service';

@Controller('/api/orgstats')
export class RepoController {
  constructor(private readonly repoService: RepoService) {}

  @Get('/')
  async getAllRepoStat(): Promise<Repo[]> {
    return await this.repoService.findAll();
  }

  @Get('/org/:org')
  async getAllRepoStatByOrg(@Param('org') org: string): Promise<Repo[]> {
    return await this.repoService.findAllByOrg(org);
  }

  @Get('/repo/:repo')
  async getRepoStatByRepo(@Param('repo') repo: string): Promise<Repo[]> {
    return await this.repoService.findAllByRepo(repo);
  }

  @Get(':org')
  async getRepoStat(
    @Param('org') org: string,
    @Query('filters') { repositories, time },
  ): Promise<Repo[]> {
    return await this.repoService.findByOrgByReposAndTime(
      org,
      repositories,
      time,
    );
  }

  @Get(':org/issues')
  async getRepoIssues(
    @Param('org') org: string,
    @Query('filters') { repositories },
  ): Promise<Repo[]> {
    return await this.repoService.findIssuesByOrgByRepos(org, repositories);
  }

  @Get(':org/pullRequests')
  async getRepoRequests(
    @Param('org') org: string,
    @Query('filters') { repositories },
  ): Promise<Repo[]> {
    return await this.repoService.findPullRequestsByOrgByRepos(
      org,
      repositories,
    );
  }
}

import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { GithubService } from '../github/github.service';
import { ProducerService } from '../synchronize/producer.service';
import { RepoService } from './repo.service';

@Controller('/api/orgstats')
export class RepoController {
  constructor(
    private readonly synchronizeProducerService: ProducerService,
    private readonly githubService: GithubService,
    private readonly reposStatsService: RepoService /* private readonly githubService: GithubService, */,
  ) {}

  @Get('/')
  async getAllRepoStat(): Promise<Repo[]> {
    return await this.reposStatsService.findAll();
  }

  @Get('/org/:org')
  async getAllRepoStatByOrg(@Param('org') org: string): Promise<Repo[]> {
    return await this.reposStatsService.findAllByOrg(org);
  }

  @Get('/repo/:repo')
  async getRepoStatByRepo(@Param('repo') repo: string): Promise<Repo[]> {
    return await this.reposStatsService.findAllByRepo(repo);
  }

  @Get(':org')
  async getRepoStat(
    @Param('org') org: string,
    @Query('filters') { repositories },
  ): Promise<Repo[]> {
    return await this.reposStatsService.findByOrgByRepos(org, repositories);
  }

  @Post('/synchronize')
  async getAllRepoStatOfAllOrg(): Promise<void> {
    // await this.reposStatsService.getCommitsOfAllRepoOfAllOrg();
    // await this.reposStatsService.syncIssuesForAllRepoOfAllOrgs();

    // TODO : call queue instead of doing synchronously
    // TODO : get organization & repos from database
    await this.synchronizeProducerService.addJob({
      organization: 'toto',
      repositories: ['titi', 'tata'],
      githubToken: this.githubService.getToken(),
    });
  }
}

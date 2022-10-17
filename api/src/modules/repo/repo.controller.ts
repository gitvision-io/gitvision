import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { User } from 'src/entities/user.entity';
import { USER } from '../users/users.decorator';
import { UsersService } from '../users/users.service';
import { RepoService } from './repo.service';

@Controller('/api/orgstats')
export class RepoController {
  constructor(
    private readonly repoService: RepoService,
    private usersService: UsersService,
  ) {}

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

  @Post('/synchronize')
  async getAllRepoStatOfAllOrg(
    @USER() user: User,
  ): Promise<{ status: string }> {
    let date: Date;
    if (!user.lastSynchronize) {
      date = new Date();
      this.usersService.update(user.id, { lastSynchronize: date });
      date.setMonth(date.getMonth() - 6);
    } else {
      date = user.lastSynchronize;
    }

    // Get Commits
    await this.repoService.getCommitsOfAllRepoOfAllOrg(date);
    await this.repoService.getCommitsOfAllRepoOfUser(date);

    //await this.repoService.syncIssuesForAllRepoOfAllOrgs(date);

    // Get Issues
    await this.repoService.getIssuesOfAllRepoOfAllOrg();
    await this.repoService.getIssuesOfAllRepoOfUser();

    // Get Pull Requests
    await this.repoService.getPullRequestsOfAllRepoOfAllOrg();
    await this.repoService.getPullRequestsOfAllRepoOfUser();

    this.usersService.update(user.id, { lastSynchronize: new Date() });

    return { status: 'Synchronized !' };
  }
}

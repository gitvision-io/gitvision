import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { GithubService } from '../github/github.service';
import { ProducerService } from '../synchronize/producer.service';
import { USER } from '../users/users.decorator';
import { UsersService } from '../users/users.service';
import { RepoService } from './repo.service';

@Controller('/api/orgstats')
export class RepoController {
  constructor(
    private readonly synchronizeProducerService: ProducerService,
    private readonly githubService: GithubService,
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
    await this.repoService.getCommitsOfAllRepoOfAllOrg(date);
    await this.repoService.getCommitsOfAllRepoOfUser(date);

    //await this.repoService.syncIssuesForAllRepoOfAllOrgs(date);

    await this.repoService.getIssuesOfAllRepoOfAllOrg();
    await this.repoService.getIssuesOfAllRepoOfUser();
    await this.repoService.getPullRequestsOfAllRepoOfAllOrg();
    await this.repoService.getPullRequestsOfAllRepoOfUser();

    //await this.repoService.syncIssuesForAllRepoOfAllOrgs();


    // TODO : call queue instead of doing synchronously
    // TODO : get organization & repos from database
    // await this.synchronizeProducerService.addJob({
    //   organization: 'toto',
    //   repositories: ['titi', 'tata'],
    //   githubToken: this.githubService.getToken(),
    // });

    this.usersService.update(user.id, { lastSynchronize: new Date() });

    return { status: 'Synchronized !' };
  }
}

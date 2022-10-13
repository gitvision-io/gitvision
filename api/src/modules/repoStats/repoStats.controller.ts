import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RepoStats } from 'src/entities/repoStats.entity';
import { RepoStatsService } from './repoStats.service';

@Controller('/api/repostats')
export class RepoStatsController {
  constructor(
    private readonly reposStatsService: RepoStatsService /* private readonly githubService: GithubService, */,
  ) {}

  @Get('/')
  async getAllRepoStat(): Promise<RepoStats[]> {
    return await this.reposStatsService.findAll();
  }

  @Get('/org/:org')
  async getAllRepoStatByOrg(@Param('org') org: string): Promise<RepoStats[]> {
    return await this.reposStatsService.findAllByOrg(org);
  }

  @Get('/repo/:repo')
  async getRepoStatByRepo(@Param('repo') repo: string): Promise<RepoStats[]> {
    return await this.reposStatsService.findAllByRepo(repo);
  }

  @Get(':org')
  async getRepoStat(
    @Param('org') org: string,
    @Query('repos') repos: string[],
  ): Promise<RepoStats[]> {
    return await this.reposStatsService.findByOrgByRepos(org, repos);
  }

  @Post('/synchronize')
  async getAllRepoStatOfAllOrg(): Promise<void> {
    await this.reposStatsService.getCommitsOfAllRepoOfAllOrg();
    await this.reposStatsService.syncIssuesForAllRepoOfAllOrgs();
  }

  /* @Put('me')
  async setUser(
    @Req() request: Request,
    @Body() userDto: UserDTO,
  ): Promise<{ status: string }> {
    await this.reposStatsService.upsert(request['token'].sub, userDto);
    return { status: 'ok' };
  }

  @Put('me/profile')
  async setUserProfile(
    @Req() request: Request,
    @Body() userProfileDto: UserProfileDTO,
  ): Promise<{ status: string }> {
    await this.reposStatsService.updateProfile(
      request['token'].sub,
      userProfileDto,
    );
    return { status: 'ok' };
  }

  @Delete('me/github')
  async deleteGithubAccess(
    @USER() user: User,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    await this.githubService.revokeAccess(user.githubToken);
    await this.reposStatsService.update(request['token'].sub, {
      githubId: null,
      githubToken: null,
    });
    return { status: 'ok' };
  } */
}

import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { RepoStats } from 'src/entities/repoStats.entity';
import { User } from 'src/entities/user.entity';
import { GithubService } from '../github/github.service';
import { RepoStatsService } from './repoStats.service';
/* import { USER } from './users.decorator';
import { UserDTO, UserProfileDTO } from './users.dto';
import { UsersService } from './users.service'; */

@Controller('/api/repostats')
export class RepoStatsController {
  constructor(
    private readonly reposStatsService: RepoStatsService /* private readonly githubService: GithubService, */,
  ) {}

  @Get('repo/:id')
  async getUser(@Param('id') id: string): Promise<RepoStats> {
    return await this.reposStatsService.findOne(id);
  }

  /*   @Get('org/:org/reponame/:reponame')
  async getRepoStat(
    @Param('org') org: string,
    @Param('reponame') reponame: string,
  ): Promise<RepoStats> {
    return await this.reposStatsService.getCommitsOfRepo(org, reponame);
  } */

  @Get('/')
  async getAllRepoStatOfAllOrg(): Promise<RepoStats[]> {
    return await this.reposStatsService.getCommitsOfAllRepoOfAllOrg();
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

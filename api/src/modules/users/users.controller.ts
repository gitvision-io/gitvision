import { Body, Controller, Delete, Get, Put, Req } from '@nestjs/common';
import { Request } from 'express';
import { Repo } from 'src/entities/repo.entity';
import { User } from 'src/entities/user.entity';
import { GitProviderService } from '../git-provider/gitprovider.service';
import { RepoService } from '../repo/repo.service';
import { USER } from './users.decorator';
import { UserDTO, UserProfileDTO } from './users.dto';
import { UsersService } from './users.service';

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gitProviderService: GitProviderService,
    private readonly repoService: RepoService,
  ) {}

  @Get('me')
  async getUser(@USER() user: User): Promise<User> {
    return await this.usersService.findOne(user.id);
  }

  @Put('me')
  async setUser(
    @Req() request: Request,
    @Body() userDto: UserDTO,
  ): Promise<{ status: string }> {
    await this.usersService.upsert(request['token'].sub, userDto);
    return { status: 'ok' };
  }

  @Put('me/profile')
  async setUserProfile(
    @Req() request: Request,
    @Body() userProfileDto: UserProfileDTO,
  ): Promise<{ status: string }> {
    await this.usersService.updateProfile(request['token'].sub, userProfileDto);
    return { status: 'ok' };
  }

  @Put('me/repositories')
  async setRepositories(@USER() user: User): Promise<{ status: string }> {
    const reposOrg = await this.repoService.getAllRepoOfAllOrgWithPagination();
    const reposUser = await this.repoService.getAllRepoOfUserWithPagination();
    const reposEntities: Repo[] = reposOrg.concat(reposUser);
    await this.usersService.addRepositories(user, reposEntities);
    return { status: 'ok' };
  }

  @Delete('me/gitProvider')
  async deleteGithubAccess(
    @USER() user: User,
    @Req() request: Request,
  ): Promise<{ status: string }> {
    await this.gitProviderService.revokeAccess(user.gitProviderToken);
    await this.usersService.update(request['token'].sub, {
      gitProviderId: null,
      gitProviderToken: null,
      gitProviderName: null,
    });
    return { status: 'ok' };
  }
}

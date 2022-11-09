import { Controller, Get, Put } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { User } from 'src/entities/user.entity';
import { GitProviderService } from '../git-provider/gitprovider.service';
import { USER } from './users.decorator';
import { UsersService } from './users.service';

@Controller('/api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly gitProviderService: GitProviderService,
  ) {}

  @Get('me')
  async getUser(@USER() user: User): Promise<User> {
    return await this.usersService.findOne(user.id);
  }

  @Put('me/repositories')
  async setRepositories(@USER() user: User): Promise<{ status: string }> {
    const orgs = await this.gitProviderService.getAllOrgs();
    const reposOrg = await this.gitProviderService.getAllRepoOfOrgs(orgs);
    const reposUser = await this.gitProviderService.getAllReposOfUser();
    const reposEntities: Repo[] = reposOrg.concat(reposUser);
    await this.usersService.addRepositories(user, reposEntities);
    return { status: 'ok' };
  }
}

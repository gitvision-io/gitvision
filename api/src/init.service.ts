import { Injectable } from '@nestjs/common';
import { Repo } from './entities/repo.entity';
import { GitProviderService } from './modules/git-provider/gitprovider.service';
import { UsersService } from './modules/users/users.service';

@Injectable()
export class InitService {
  constructor(
    private readonly usersService: UsersService,
    private readonly gitProviderService: GitProviderService,
  ) {}

  async createUser() {
    await this.usersService.upsert('user', {
      email: 'user@email.com',
      name: 'user',
      gitProviderToken: process.env.GIT_PROVIDER_TOKEN,
      gitProviderName: process.env.GIT_PROVIDER_NAME,
    });
    const user = await this.usersService.findOne('user');
    this.gitProviderService.auth(user.gitProviderName, user.gitProviderToken);
    const orgs = await this.gitProviderService.getAllOrgs();
    const reposOrg = await this.gitProviderService.getAllRepoOfOrgs(orgs);
    const reposUser = await this.gitProviderService.getAllReposOfUser();
    const reposEntities: Repo[] = reposOrg.concat(reposUser);
    await this.usersService.addRepositories(user, reposEntities);
  }
}

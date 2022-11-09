import { Controller, Get, Param } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { GitProviderService } from '../git-provider/gitprovider.service';
import { USER } from '../users/users.decorator';
import { OrgsService } from './orgs.service';

@Controller('/api/orgs')
export class OrgsController {
  constructor(
    private readonly orgsService: OrgsService,
    private readonly gitProviderService: GitProviderService,
  ) {}

  @Get('')
  async getOrgs(): Promise<{ login: string; isUser: boolean }[]> {
    const orgs = await this.gitProviderService.getAllOrgs();
    const profile = await this.gitProviderService.getProfile();

    return [
      { ...profile, isUser: true },
      ...orgs.map((o) => ({ login: o.login, isUser: false })),
    ];
  }

  @Get(':org/repos')
  async getOrgRepositories(
    @USER() user: User,
    @Param('org') org: string,
  ): Promise<string[]> {
    return await this.orgsService.getRepositories(
      org === 'user' ? null : org,
      user.id,
    );
  }
}

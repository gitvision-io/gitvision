import { Controller, Get, Param, Query } from '@nestjs/common';
import { User } from '@octokit/graphql-schema';
import { Repo } from 'src/entities/repo.entity';
import { USER } from '../users/users.decorator';
import { OrgsService } from './orgs.service';

@Controller('/api/orgstats')
export class OrgstatsController {
  constructor(private readonly orgsService: OrgsService) {}

  @Get(':org')
  async getRepoStat(
    @USER() user: User,
    @Param('org') org: string,
    @Query('filters') { repositories, time },
  ): Promise<Repo[]> {
    return await this.orgsService.findByOrgByReposAndTime(
      org === 'user' ? null : org,
      repositories,
      time,
      user.id,
    );
  }
}

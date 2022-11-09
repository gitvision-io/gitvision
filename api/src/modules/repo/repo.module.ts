import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { User } from 'src/entities/user.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { OrgsController } from './orgs.controller';
import { OrgstatsController } from './orgstats.controller';
import { GitProviderModule } from '../git-provider/gitprovider.module';
import { RepoService } from './repo.service';
import { OrgsService } from './orgs.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GitProviderModule,
    HttpModule,
  ],
  exports: [RepoService],
  providers: [OrgsService, RepoService],
  controllers: [OrgsController, OrgstatsController],
})
export class RepoModule {}

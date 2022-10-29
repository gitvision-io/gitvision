import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { RepoService } from './repo.service';
import { User } from 'src/entities/user.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { OrgsController } from './orgs.controller';
import { OrgstatsController } from './orgstats.controller';
import { GitProviderModule } from '../git-provider/gitprovider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GitProviderModule,
  ],
  exports: [RepoService],
  providers: [RepoService],
  controllers: [OrgsController, OrgstatsController],
})
export class RepoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { GithubModule } from '../github/github.module';
import { RepoService } from './repo.service';
import { User } from 'src/entities/user.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { OrgsController } from './orgs.controller';
import { OrgstatsController } from './orgstats.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GithubModule,
  ],
  exports: [RepoService],
  providers: [RepoService],
  controllers: [OrgsController, OrgstatsController],
})
export class RepoModule {}

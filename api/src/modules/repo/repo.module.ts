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
import { RepoGithubModule } from './github/repo.github.module';
import { RepoGitlabModule } from './gitlab/repo.gitlab.module';
import { RepoGithubService } from './github/repo.github.service';
import { RepoGitlabService } from './gitlab/repo.gitlab.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GitProviderModule,
    RepoGithubModule,
    RepoGitlabModule,
    RepoModule,
  ],
  exports: [RepoService],
  providers: [RepoService, RepoGithubService, RepoGitlabService],
  controllers: [OrgsController, OrgstatsController],
})
export class RepoModule {}

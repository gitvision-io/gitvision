import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { User } from 'src/entities/user.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { GitProviderModule } from '../../git-provider/gitprovider.module';
import { RepoGitlabService } from './repo.gitlab.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GitProviderModule,
  ],
  exports: [RepoGitlabService],
  providers: [RepoGitlabService],
  controllers: [],
})
export class RepoGitlabModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { RepoGithubService } from './repo.github.service';
import { User } from 'src/entities/user.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { GitProviderModule } from '../../git-provider/gitprovider.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GitProviderModule,
  ],
  exports: [RepoGithubService],
  providers: [RepoGithubService],
  controllers: [],
})
export class RepoGithubModule {}

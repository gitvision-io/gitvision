import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { GithubModule } from '../github/github.module';
import { SynchronizeModule } from '../synchronize/synchronize.module';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';
import { User } from 'src/entities/user.entity';
import { UsersService } from '../users/users.service';
import { PullRequest } from 'src/entities/pullrequest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue, PullRequest, User]),
    GithubModule,
    SynchronizeModule,
  ],
  exports: [RepoService],
  providers: [RepoService, UsersService],
  controllers: [RepoController],
})
export class RepoModule {}

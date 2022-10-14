import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { Repo } from 'src/entities/repo.entity';
import { Commit } from 'src/entities/commit.entity';
import { GithubModule } from '../github/github.module';
import { SynchronizeModule } from '../synchronize/synchronize.module';
import { RepoController } from './repo.controller';
import { RepoService } from './repo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Repo, Commit, Issue]),
    GithubModule,
    SynchronizeModule,
  ],
  exports: [RepoService],
  providers: [RepoService],
  controllers: [RepoController],
})
export class RepoModule {}

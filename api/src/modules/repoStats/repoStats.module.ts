import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from 'src/entities/issue.entity';
import { RepoStats } from 'src/entities/repoStats.entity';
import { UserRepoStats } from 'src/entities/userRepoStats.entity';
import { GithubModule } from '../github/github.module';
import { RepoStatsController } from './repoStats.controller';
import { RepoStatsService } from './repoStats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RepoStats, UserRepoStats, Issue]),
    GithubModule,
  ],
  exports: [RepoStatsService],
  providers: [RepoStatsService],
  controllers: [RepoStatsController],
})
export class RepoStatsModule {}

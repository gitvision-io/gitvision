import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepoStats } from 'src/entities/repoStats.entity';
import { UserRepoStats } from 'src/entities/userRepoStats.entity';
import { GithubModule } from '../github/github.module';
import { RepoStatsController } from './repoStats.controller';
import { RepoStatsService } from './repoStats.service';

@Module({
  imports: [TypeOrmModule.forFeature([RepoStats, UserRepoStats]), GithubModule],
  exports: [RepoStatsService],
  providers: [RepoStatsService],
  controllers: [RepoStatsController],
})
export class RepoStatsModule {}

import { Module } from '@nestjs/common';
import { RepoGithubService } from './repo.github.service';

@Module({
  imports: [],
  exports: [RepoGithubService],
  providers: [RepoGithubService],
  controllers: [],
})
export class RepoGithubModule {}

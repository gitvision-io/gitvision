import { Module } from '@nestjs/common';
import { RepoGitlabService } from './repo.gitlab.service';

@Module({
  imports: [],
  exports: [RepoGitlabService],
  providers: [RepoGitlabService],
  controllers: [],
})
export class RepoGitlabModule {}

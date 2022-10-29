import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GithubModule } from '../github/github.module';
import { GithubService } from '../github/github.service';
import { GitlabModule } from '../gitlab/gitlab.module';
import { GitlabService } from '../gitlab/gitlab.service';
import { GitProviderService } from './gitprovider.service';

@Module({
  imports: [GithubModule, GitlabModule, HttpModule],
  exports: [GitProviderService],
  providers: [GitProviderService, GithubService, GitlabService],
  controllers: [],
})
export class GitProviderModule {}

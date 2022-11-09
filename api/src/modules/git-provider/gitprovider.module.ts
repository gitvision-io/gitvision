import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GitlabService } from './gitlab.service';
import { GitProviderService } from './gitprovider.service';

@Module({
  imports: [HttpModule],
  exports: [GitProviderService],
  providers: [GitProviderService, GithubService, GitlabService],
  controllers: [],
})
export class GitProviderModule {}

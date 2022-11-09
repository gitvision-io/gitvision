import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { GitProviderService } from '../git-provider/gitprovider.service';
import { RepoService } from '../repo/repo.service';
import { SynchronizeJob } from './producer.service';

@Injectable()
export class SynchronizeService {
  constructor(
    protected readonly gitProviderService: GitProviderService,
    protected readonly repoService: RepoService,
  ) {}

  auth(gitProviderName: string, token: string): void {
    this.gitProviderService.auth(gitProviderName, token);
  }

  async synchronize(date: Date, job?: Job<SynchronizeJob>) {
    // Get Commits
    await this.repoService.getCommitsOfRepos(job.data.repos, date);
    await job?.progress(40);

    // Get Issues
    await this.repoService.getIssuesOfRepos(job.data.repos, date);
    await job?.progress(70);

    // Get Pull Requests
    await this.repoService.getPullRequestsOfRepos(job.data.repos, date);
    await job?.progress(90);
  }
}

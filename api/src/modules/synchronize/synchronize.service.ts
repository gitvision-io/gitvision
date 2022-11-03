import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { RepoService } from '../repo/repo.service';

@Injectable()
export class SynchronizeService {
  constructor(private readonly repoService: RepoService) {}

  auth(gitProviderName: string, token: string): void {
    this.repoService.auth(gitProviderName, token);
  }

  async synchronize(date: Date, job?: Job) {
    // Get Commits
    await this.repoService.getCommitsOfAllRepoOfAllOrgWithPagination(date);
    await job?.progress(30);
    await this.repoService.getCommitsOfAllRepoOfUserWithPagination(date);
    await job?.progress(40);

    // Get Issues
    await this.repoService.getIssuesOfAllRepoOfAllOrgWithPagination();
    await job?.progress(60);
    await this.repoService.getIssuesOfAllRepoOfUserWithPagination();
    await job?.progress(70);

    // Get Pull Requests
    await this.repoService.getPullRequestsOfAllRepoOfAllOrgWithPagination();
    await job?.progress(80);
    await this.repoService.getPullRequestsOfAllRepoOfUserWithPagination();
    await job?.progress(90);
  }
}

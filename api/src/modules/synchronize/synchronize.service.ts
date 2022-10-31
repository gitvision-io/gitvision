import { Injectable } from '@nestjs/common';
import { RepoService } from '../repo/repo.service';

@Injectable()
export class SynchronizeService {
  constructor(private readonly repoService: RepoService) {}

  auth(gitProviderName: string, token: string): void {
    this.repoService.auth(gitProviderName, token);
  }

  async synchronize(date: Date) {
    // Get Commits
    await this.repoService.getCommitsOfAllRepoOfAllOrgWithPagination(date);
    await this.repoService.getCommitsOfAllRepoOfUserWithPagination(date);

    // Get Issues
    await this.repoService.getIssuesOfAllRepoOfAllOrgWithPagination();
    await this.repoService.getIssuesOfAllRepoOfUserWithPagination();

    // Get Pull Requests
    await this.repoService.getPullRequestsOfAllRepoOfAllOrgWithPagination();
    await this.repoService.getPullRequestsOfAllRepoOfUserWithPagination();
  }
}

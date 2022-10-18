import { Injectable } from '@nestjs/common';
import { RepoService } from '../repo/repo.service';

@Injectable()
export class SynchronizeService {
  constructor(private readonly repoService: RepoService) {}

  auth(token: string): void {
    this.repoService.auth(token);
  }

  async synchronize(date: Date) {
    // Get Commits
    await this.repoService.getCommitsOfAllRepoOfAllOrg(date);
    await this.repoService.getCommitsOfAllRepoOfUser(date);
    // Get Issues
    // await this.repoService.getIssuesOfAllRepoOfAllOrg();
    // await this.repoService.getIssuesOfAllRepoOfUser();
    // Get Pull Requests
    await this.repoService.syncIssuesForAllRepoOfAllOrgs(date);

    // await this.repoService.getAllOrgWithPagination();
    // await this.repoService.getAllRepoOfAllOrgWithPagination();
    // await this.repoService.getAllRepoOfUserWithPagination();
  }
}

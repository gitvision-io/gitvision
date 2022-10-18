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
    //await this.repoService.getCommitsOfAllRepoOfAllOrg(date);
    //await this.repoService.getCommitsOfAllRepoOfUser(date);

    await this.repoService.getAllOrgWithPagination();
    await this.repoService.getAllRepoOfAllOrgWithPagination();
    //console.log('hi');
    await this.repoService.getAllRepoOfUserWithPagination();

    // Get Issues
    //await this.repoService.getIssuesOfAllRepoOfAllOrg1();
    //await this.repoService.getIssuesOfAllRepoOfUser1();

    // Get Pull Requests
    //await this.repoService.getPullRequestsOfAllRepoOfAllOrg1();
    //await this.repoService.getPullRequestsOfAllRepoOfUser1();
    //await this.repoService.syncIssuesForAllRepoOfAllOrgs();
  }
}

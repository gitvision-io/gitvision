export class RepoStatsDTO {
  repoId?: string;
  repoName?: string;
  organization?: string;
  numberOfCommits?: number;
  userRepoStats?: UserRepoStatsDTO[];
}

export class UserRepoStatsDTO {
  commitId: string;
  repoId: string;
  author?: string;
  date: Date;
  numberOfLineAdded?: number;
  numberOfRemoved?: number;
  numberOfModified?: number;
}

export class RepoStatsDTO {
  repoId?: string;
  repoName?: string;
  organization?: string;
  userRepoStats?: UserRepoStatsDTO[];
}

export class UserRepoStatsDTO {
  repoId: string;
  author?: string;
  date: Date;
  numberOfCommit?: number;
  numberOfLineAdded?: number;
  numberOfRemoved?: number;
  numberOfModified?: number;
}

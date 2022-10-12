import { UserRepoStats } from 'src/entities/userRepoStats.entity';

export class RepoStatsDTO {
  repoId?: string;
  repoName?: string;
  organization?: string;
  numberOfCommits?: number;
  userRepoStats?: UserRepoStats[];
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

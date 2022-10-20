export interface Contributor {
  author: string;
  numberOfCommits: number;
  lineOfCodeChanges: number;
  commitActivity: number;
  numberOfLineAdded: number;
  numberOfLineRemoved: number;
  numberOfLineModified: number;
  date: Date;
}

export interface Commit {
  id: string;
  author: string;
  date: string;
  repoId: string;
  numberOfLineAdded: number;
  numberOfLineRemoved: number;
  numberOfLineModified: number;
}

export interface PullRequest {
  id: string;
  repoId: string;
  createdAt: Date;
  closedAt?: any;
  state: string;
}

export interface RepositoryStatistics {
  id: string;
  repoName: string;
  organization: string;
  commits: Commit[];
  issues: any[];
  pullRequests: PullRequest[];
}

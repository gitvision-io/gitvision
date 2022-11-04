export interface User {
  id: string;
  gitProviderId: string;
  gitProviderName: string;
  email: string;
  name: string;
  lastSynchronize?: string;
}
export interface Contributor {
  author: string;
  numberOfCommits: number;
  lineOfCodeChanges: number;
  commitActivity: number;
  numberOfLineAdded: number;
  numberOfLineRemoved: number;
  totalNumberOfLine: number;
  date: Date;
}

export interface Commit {
  id: string;
  author: string;
  date: string;
  repoId: string;
  numberOfLineAdded: number;
  numberOfLineRemoved: number;
  totalNumberOfLine: number;
}

export interface PullRequest {
  id: string;
  repoId: string;
  createdAt: string;
  closedAt?: string;
  state: string;
}

export interface Issue {
  id: string;
  repoId: string;
  createdAt: Date;
  closedAt?: string;
  state: string;
}

export interface RepositoryStatistics {
  id: string;
  name: string;
  organization: string;
  commits: Commit[];
  issues: any[];
  pullRequests: PullRequest[];
}

export enum KpiCategory {
  Contributors = "contributors",
  ActiveRepositories = "activeRepositories",
  PullRequests = "pullRequest",
  Issues = "issues",
}

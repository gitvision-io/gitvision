import { Injectable } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';

import { Gitlab } from '@gitbeaker/node';
import {
  ProjectSchema,
  CommitExtendedSchema,
  IssueSchema,
  MergeRequestSchema,
} from '@gitbeaker/core/dist/types/types';
import { Commit } from 'src/entities/commit.entity';
import { Issue } from 'src/entities/issue.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';

export interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

const defaultAPI = new Gitlab(null);

@Injectable()
export class RepoGitlabService {
  #api: typeof defaultAPI;

  auth(token: string): void {
    this.#api = new Gitlab({
      host: 'https://gitlab.com',
      oauthToken: token,
    });
  }

  // Get all organisations
  async getAllOrgWithPagination(): Promise<Organization[]> {
    const organizations: Organization[] = [];
    return organizations;
  }

  // Get all repositories
  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    const orgs = await this.#api.Groups.all({ maxPages: 50000 });

    await Promise.all([
      ...orgs.map(async (o) => {
        if (o.id) {
          const projects: ProjectSchema[] = await this.#api.Groups.projects(
            o.id,
          );

          if (projects) {
            projects.map((p) => {
              if (p.id != null) {
                const repo: Repo = new Repo();
                repo.id = p.id.toString();
                repo.name = p.name;
                repo.organization = o.full_path;

                repositories.push(repo);
              }
            });
          }
        }
      }),
    ]);
    return repositories;
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];

    return repositories;
  }

  // Get all commits
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<Repo[]> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    return await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const commitsGitlab = await this.#api.Commits.all(r.id, {
            maxPages: 50000,
            since: date,
            with_stats: true,
          });
          const commits = commitsGitlab.map(
            (commitsStatsGitlab: CommitExtendedSchema) => {
              if (commitsStatsGitlab.id != null) {
                const commit = new Commit();
                commit.id = commitsStatsGitlab.id as string;

                commit.repoId = r.id.toString();
                commit.date = commitsStatsGitlab.committed_date;
                commit.author = commitsStatsGitlab.author_name;
                commit.numberOfLineAdded = commitsStatsGitlab.stats.additions;
                commit.numberOfLineRemoved = commitsStatsGitlab.stats.deletions;
                commit.totalNumberOfLine = commitsStatsGitlab.stats.total;
                return commit;
              }
            },
          );
          r.commits = commits;
        }
        return r;
      }),
    ]);
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(date: Date): Promise<Repo[]> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    return await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const issuesGitlab = await this.#api.Issues.all({
            projectId: r.id,
            since: date,
          });

          const issues: Issue[] = issuesGitlab.map((i: IssueSchema) => {
            if (i.id != null) {
              const issue = new Issue();
              issue.id = i.id.toString();
              issue.repoId = r.id;
              issue.state = i.state;
              issue.createdAt = new Date(i.created_at);
              issue.closedAt = i.closed_at;

              return issue;
            }
          });
          r.issues = issues;
        }

        return r;
      }),
    ]);
  }

  async getIssuesOfAllRepoOfUserWithPagination(date: Date): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(
    date: Date,
  ): Promise<Repo[]> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    return await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const mergeRequestsGitlab = await this.#api.MergeRequests.all({
            projectId: r.id,
            since: date,
          });

          const pullRequests: PullRequest[] = mergeRequestsGitlab.map(
            (m: MergeRequestSchema) => {
              if (m.id != null) {
                const mergeRequest = new PullRequest();
                mergeRequest.id = m.id.toString();
                mergeRequest.repoId = r.id;
                mergeRequest.state = m.state;
                mergeRequest.createdAt = new Date(m.created_at);
                mergeRequest.closedAt = m.closed_at;

                return mergeRequest;
              }
            },
          );
          r.pullRequests = pullRequests;
        }

        return r;
      }),
    ]);
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }
}

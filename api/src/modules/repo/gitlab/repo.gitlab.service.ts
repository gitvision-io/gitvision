import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';

import { Repository } from 'typeorm';
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

  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  auth(token: string): void {
    this.#api = new Gitlab({
      host: 'https://gitlab.com',
      oauthToken: token,
    });
  }

  async upsert(id: string, repo: Repo): Promise<void> {
    await this.repoRepository.upsert(
      {
        id,
        ...repo,
      },
      ['id'],
    );
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
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<void> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    await Promise.all([
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
                commit.numberOfLineModified =
                  commitsStatsGitlab.stats.additions -
                  commitsStatsGitlab.stats.deletions;
                return commit;
              }
            },
          );
          r.commits = commits;
        }

        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<void> {
    return null;
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const issuesGitlab = await this.#api.Issues.all({ projectId: r.id });

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

        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getIssuesOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const mergeRequestsGitlab = await this.#api.MergeRequests.all({
            projectId: r.id,
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

        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }
}

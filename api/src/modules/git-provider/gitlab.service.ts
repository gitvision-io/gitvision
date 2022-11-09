import { Injectable } from '@nestjs/common';
import { ApolloService } from '../apollo-client/apollo.service';
import { Repo } from 'src/entities/repo.entity';
import { Gitlab } from '@gitbeaker/node';
import {
  ProjectSchema,
  CommitExtendedSchema,
  IssueSchema,
  MergeRequestSchema,
} from '@gitbeaker/core/dist/types/types';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { Commit } from 'src/entities/commit.entity';
import { Issue } from 'src/entities/issue.entity';
import { Organization } from 'src/common/types';

const defaultAPI = new Gitlab(null);

@Injectable()
export class GitlabService {
  apolloService: ApolloService;
  #token: string;
  #api: typeof defaultAPI;

  constructor() {}

  auth(token: string): void {
    this.#token = token;
    this.#api = new Gitlab({
      host: 'https://gitlab.com',
      oauthToken: token,
    });
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<string[]> {
    const orgs = await this.#api.Groups.all({ maxPages: 50000 });
    return orgs.flatMap((o) => o.full_path);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    const { id, username: login } = await this.#api.Users.current();
    return { id, login };
  }

  async getOrgRepositories(org: string): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }

  // Get all organisations
  async getAllOrgs(): Promise<Organization[]> {
    const organizations: Organization[] = [];
    return organizations;
  }

  // Get all repositories
  async getAllReposOfOrgs(orgs: Organization[]): Promise<Repo[]> {
    const repositories: Repo[] = [];

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

  async getAllReposOfUser(): Promise<Repo[]> {
    const repositories: Repo[] = [];

    return repositories;
  }

  // Get all commits
  async getCommitsOfRepos(repos: Repo[], date: Date): Promise<Commit[]> {
    return (
      await Promise.all([
        ...repos
          .filter((r) => r.id)
          .map(async (r) => {
            const commitsGitlab = await this.#api.Commits.all(r.id, {
              maxPages: 50000,
              since: date,
              with_stats: true,
            });
            return commitsGitlab
              .filter((c) => c.id)
              .map((commitsStatsGitlab: CommitExtendedSchema) => {
                const commit = new Commit();
                commit.id = commitsStatsGitlab.id as string;

                commit.repoId = r.id.toString();
                commit.date = commitsStatsGitlab.committed_date;
                commit.author = commitsStatsGitlab.author_name;
                commit.numberOfLineAdded = commitsStatsGitlab.stats.additions;
                commit.numberOfLineRemoved = commitsStatsGitlab.stats.deletions;
                commit.totalNumberOfLine = commitsStatsGitlab.stats.total;
                return commit;
              });
          }),
      ])
    ).flatMap((c) => c);
  }

  // Get all issues
  async getIssuesOfRepos(repos: Repo[], date: Date): Promise<Issue[]> {
    return (
      await Promise.all([
        ...repos
          .filter((r) => r.id)
          .map(async (r) => {
            const issuesGitlab = await this.#api.Issues.all({
              projectId: r.id,
              since: date,
            });

            return issuesGitlab
              .filter((i) => i.id)
              .map((i: IssueSchema) => {
                const issue = new Issue();
                issue.id = i.id.toString();
                issue.repoId = r.id;
                issue.state = i.state;
                issue.createdAt = new Date(i.created_at);
                issue.closedAt = i.closed_at;

                return issue;
              });
          }),
      ])
    ).flatMap((i) => i);
  }

  // Get all pull requests
  async getPullRequestsOfRepos(
    repos: Repo[],
    date: Date,
  ): Promise<PullRequest[]> {
    return (
      await Promise.all([
        ...repos
          .filter((r) => r.id)
          .map(async (r) => {
            const mergeRequestsGitlab = await this.#api.MergeRequests.all({
              projectId: r.id,
              since: date,
            });

            return mergeRequestsGitlab
              .filter((mr) => mr.id)
              .map((m: MergeRequestSchema) => {
                const mergeRequest = new PullRequest();
                mergeRequest.id = m.id.toString();
                mergeRequest.repoId = r.id;
                mergeRequest.state = m.state;
                mergeRequest.createdAt = new Date(m.created_at);
                mergeRequest.closedAt = m.closed_at;

                return mergeRequest;
              });
          }),
      ])
    ).flatMap((pr) => pr);
  }
}

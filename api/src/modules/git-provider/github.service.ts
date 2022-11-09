import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfOrgWithPagination,
  GetAllOrgsWithPaginationQuery,
  GetAllOrgsWithPagination,
  GetAllPullRequestsOfRepoWithPaginationQuery,
  GetAllPullRequestsOfRepoWithPagination,
  GetAllIssuesOfRepoWithPaginationQuery,
  GetAllIssuesOfRepoWithPagination,
  GetAllCommitsOfRepositoryQuery,
  GetAllCommitsOfRepository,
  GetAllReposOfUserWithPaginationQuery,
  GetAllReposOfUserWithPagination,
} from 'src/generated/graphql';
import { ApolloQueryResult } from '@apollo/client';
import { Repo } from 'src/entities/repo.entity';
import { IGitProvider } from './gitprovider.service';
import { Organization } from 'src/common/types';
import { Commit } from 'src/entities/commit.entity';
import { Issue } from 'src/entities/issue.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';

@Injectable()
export class GithubService implements IGitProvider {
  apolloService: ApolloService;
  #octokit: Octokit;
  #token: string;

  auth(token: string): void {
    this.#token = token;
    this.#octokit = new Octokit({
      auth: token,
    });
    this.apolloService = new ApolloService(token);
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<string[]> {
    const organizations: { id: number; login: string }[] = [];
    let orgEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllOrgsWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllOrgsWithPaginationQuery>({
          query: GetAllOrgsWithPagination,
          variables: {
            cursorOrg: orgEndCursor,
          },
        });

      orgEndCursor =
        graphQLResultWithPagination.data.viewer.organizations.pageInfo
          .endCursor;

      graphQLResultWithPagination.data.viewer.organizations.edges.map(
        (o: Record<string, any>) => {
          organizations.push({
            id: o.node.id,
            login: o.node.login,
          });
        },
      );
    } while (
      graphQLResultWithPagination.data.viewer.organizations.pageInfo.hasNextPage
    );

    return organizations.flatMap((o) => o.login);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    return (await this.#octokit.rest.users.getAuthenticated()).data;
  }

  async getOrgRepositories(org: string, onlyPublic: boolean): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfOrgWithPaginationQuery>;
    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllReposOfOrgWithPaginationQuery>({
          query: GetAllReposOfOrgWithPagination,
          variables: {
            privacy: onlyPublic ? 'PUBLIC' : null,
            orgLogin: org,
            cursorRepo: repoEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.organization.repositories.pageInfo
          .endCursor;

      graphQLResultWithPagination.data.organization.repositories.edges.map(
        (r: Record<string, any>) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          repo.organization = org;
          repo.owner = org;

          repositories.push(repo);
        },
      );
    } while (
      graphQLResultWithPagination.data.organization.repositories.pageInfo
        .hasNextPage
    );

    return repositories;
  }

  // Get all organisations
  async getAllOrgs(): Promise<Organization[]> {
    const organizations: Organization[] = [];
    let orgEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllOrgsWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllOrgsWithPaginationQuery>({
          query: GetAllOrgsWithPagination,
          variables: {
            cursorOrg: orgEndCursor,
          },
        });

      orgEndCursor =
        graphQLResultWithPagination.data.viewer.organizations.pageInfo
          .endCursor;

      graphQLResultWithPagination.data.viewer.organizations.edges.map(
        (o: Record<string, any>) => {
          organizations.push({
            id: o.node.id,
            login: o.node.login,
          });
        },
      );
    } while (
      graphQLResultWithPagination.data.viewer.organizations.pageInfo.hasNextPage
    );

    return organizations;
  }

  // Get all repositories
  async getAllReposOfOrgs(orgs: Organization[]): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfOrgWithPaginationQuery>;

    await Promise.all([
      ...orgs.map(async (org) => {
        do {
          graphQLResultWithPagination = await this.apolloService
            .githubClient()
            .query<GetAllReposOfOrgWithPaginationQuery>({
              query: GetAllReposOfOrgWithPagination,
              variables: {
                orgLogin: org.login,
                cursorRepo: repoEndCursor,
              },
            });

          repoEndCursor =
            graphQLResultWithPagination.data.organization.repositories.pageInfo
              .endCursor;

          graphQLResultWithPagination.data.organization.repositories.edges.map(
            (r: Record<string, any>) => {
              const repo: Repo = new Repo();
              repo.id = r.node.id;
              repo.name = r.node.name;
              repo.organization = org.login;
              repo.owner = org.login;

              repositories.push(repo);
            },
          );
        } while (
          graphQLResultWithPagination.data.organization.repositories.pageInfo
            .hasNextPage
        );
      }),
    ]);
    return repositories;
  }

  async getAllReposOfUser(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllReposOfUserWithPaginationQuery>({
          query: GetAllReposOfUserWithPagination,
          variables: {
            cursorRepo: repoEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.repositories.pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.repositories.edges
        .filter((r: Record<string, any>) => !r.node.isInOrganization)
        .map((r: Record<string, any>) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          repo.owner = r.node.owner?.login;
          repositories.push(repo);
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );

    return repositories;
  }

  // Get all commits
  async getCommitsOfRepos(repos: Repo[], date: Date): Promise<Commit[]> {
    return (
      await Promise.all([
        ...repos.map(async (repo) => {
          const graphQLResultWithPagination = await this.apolloService
            .githubClient()
            .query<GetAllCommitsOfRepositoryQuery>({
              query: GetAllCommitsOfRepository,
              variables: {
                name: repo.name,
                owner: repo.owner,
                date,
              },
            });

          if (
            graphQLResultWithPagination.data.repository.defaultBranchRef?.target
              .__typename === 'Commit'
          ) {
            return graphQLResultWithPagination.data.repository.defaultBranchRef.target.history.edges.map(
              (c) => {
                const commit = new Commit();
                commit.id = c.node.id;
                commit.repoId = repo.id;
                commit.author = c.node.author.name;
                commit.date = c.node.committedDate;
                commit.numberOfLineAdded = c.node.additions;
                commit.numberOfLineRemoved = c.node.deletions;
                commit.totalNumberOfLine = c.node.additions + c.node.deletions;
                return commit;
              },
            );
          }
          return [];
        }),
      ])
    ).flatMap((c) => c);
  }

  // Get all issues
  async getIssuesOfRepos(repos: Repo[], date: Date): Promise<Issue[]> {
    let issueEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllIssuesOfRepoWithPaginationQuery>;

    return (
      await Promise.all([
        ...repos.map(async (r) => {
          const issues: Issue[] = [];
          do {
            graphQLResultWithPagination = await this.apolloService
              .githubClient()
              .query<GetAllIssuesOfRepoWithPaginationQuery>({
                query: GetAllIssuesOfRepoWithPagination,
                variables: {
                  owner: r.owner,
                  name: r.name,
                  cursorIssue: issueEndCursor,
                  date,
                },
              });

            issueEndCursor =
              graphQLResultWithPagination.data.repository.issues.pageInfo
                .endCursor;
            issues.push(
              ...graphQLResultWithPagination.data.repository.issues.edges.map(
                (i) => {
                  const issue: Issue = new Issue();
                  issue.id = i.node.id;
                  issue.repoId = r.id;
                  issue.state = i.node.state;
                  issue.createdAt = i.node.createdAt;
                  issue.closedAt = i.node.closedAt;

                  return issue;
                },
              ),
            );
          } while (
            graphQLResultWithPagination.data.repository.issues.pageInfo
              .hasNextPage
          );
          return issues;
        }),
      ])
    ).flatMap((i) => i);
  }

  // Get all pull requests
  async getPullRequestsOfRepos(
    repos: Repo[],
    date: Date,
  ): Promise<PullRequest[]> {
    let pullRequestEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllPullRequestsOfRepoWithPaginationQuery>;

    return (
      await Promise.all([
        ...repos.map(async (r) => {
          const pullRequests: PullRequest[] = [];
          do {
            graphQLResultWithPagination = await this.apolloService
              .githubClient()
              .query<GetAllPullRequestsOfRepoWithPaginationQuery>({
                query: GetAllPullRequestsOfRepoWithPagination,
                variables: {
                  owner: r.owner,
                  name: r.name,
                  cursorPullRequest: pullRequestEndCursor,
                },
              });

            pullRequestEndCursor =
              graphQLResultWithPagination.data.repository.pullRequests.pageInfo
                .endCursor;
            pullRequests.push(
              ...graphQLResultWithPagination.data.repository.pullRequests.edges.map(
                (p) => {
                  const pullRequest: PullRequest = new PullRequest();
                  pullRequest.id = p.node.id;
                  pullRequest.repoId = r.id;
                  pullRequest.state = p.node.state;
                  pullRequest.createdAt = p.node.createdAt;
                  pullRequest.closedAt = p.node.closedAt;

                  return pullRequest;
                },
              ),
            );
          } while (
            graphQLResultWithPagination.data.repository.pullRequests.pageInfo
              .hasNextPage
          );
          return pullRequests;
        }),
      ])
    ).flatMap((pr) => pr);
  }
}

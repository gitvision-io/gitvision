import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { Issue } from 'src/entities/issue.entity';
import { Commit } from 'src/entities/commit.entity';
import {
  GetAllOrgsWithPagination,
  GetAllOrgsWithPaginationQuery,
  GetAllReposOfOrgWithPagination,
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfUserWithPaginationQuery,
  GetAllReposOfUserWithPagination,
  GetAllCommitsOfAllReposOfAllOrgWithPagination,
  GetAllCommitsOfAllReposOfAllOrgWithPaginationQuery,
  GetAllCommitsOfAllReposOfUserWithPagination,
  GetAllCommitsOfAllReposOfUserWithPaginationQuery,
  GetAllIssuesOfAllReposOfAllOrgWithPaginationQuery,
  GetAllIssuesOfAllReposOfAllOrgWithPagination,
  GetAllPullRequestsOfAllReposOfAllOrgWithPaginationQuery,
  GetAllPullRequestsOfAllReposOfAllOrgWithPagination,
  GetAllIssuesOfAllRepoOfUserWithPaginationQuery,
  GetAllIssuesOfAllRepoOfUserWithPagination,
  GetAllPullRequestsOfAllRepoOfUserWithPaginationQuery,
  GetAllPullRequestsOfAllRepoOfUserWithPagination,
} from 'src/generated/graphql';
import { Repository } from 'typeorm';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { ApolloQueryResult } from '@apollo/client';
import { ApolloService } from 'src/modules/apollo-client/apollo.service';

export interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

@Injectable()
export class RepoGithubService {
  apolloService: ApolloService;
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  auth(token: string): void {
    this.apolloService = new ApolloService(token);
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
            databaseId: o.node.databaseId,
          });
        },
      );
    } while (
      graphQLResultWithPagination.data.viewer.organizations.pageInfo.hasNextPage
    );

    return organizations;
  }

  // Get all repositories
  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    const allOrgs = await this.getAllOrgWithPagination();
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfOrgWithPaginationQuery>;

    await Promise.all([
      ...allOrgs.map(async (o) => {
        do {
          graphQLResultWithPagination = await this.apolloService
            .githubClient()
            .query<GetAllReposOfOrgWithPaginationQuery>({
              query: GetAllReposOfOrgWithPagination,
              variables: {
                orgLogin: o.login,
                cursorRepo: repoEndCursor,
              },
            });

          repoEndCursor =
            graphQLResultWithPagination.data.viewer.organization.repositories
              .pageInfo.endCursor;

          graphQLResultWithPagination.data.viewer.organization.repositories.edges.map(
            (r: Record<string, any>) => {
              const repo: Repo = new Repo();
              repo.id = r.node.id;
              repo.name = r.node.name;
              repo.organization = o.login;

              repositories.push(repo);
            },
          );
        } while (
          graphQLResultWithPagination.data.viewer.organization.repositories
            .pageInfo.hasNextPage
        );
      }),
    ]);
    return repositories;
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
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
          repositories.push(repo);
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );

    return repositories;
  }

  // Get all commits
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<void> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    await Promise.all([
      ...allRepos.map(async (r) => {
        const graphQLResultWithPagination = await this.apolloService
          .githubClient()
          .query<GetAllCommitsOfAllReposOfAllOrgWithPaginationQuery>({
            query: GetAllCommitsOfAllReposOfAllOrgWithPagination,
            variables: {
              orgLogin: r.organization,
              name: r.name,
              date,
            },
          });

        if (
          graphQLResultWithPagination.data.viewer.organization.repository
            .defaultBranchRef?.target.__typename === 'Commit'
        ) {
          const commits: Commit[] =
            graphQLResultWithPagination.data.viewer.organization.repository.defaultBranchRef.target.history.edges.map(
              (c) => {
                const commit = new Commit();
                commit.id = c.node.id;
                commit.repoId = r.id;
                commit.author = c.node.author.name;
                commit.date = c.node.committedDate;
                commit.numberOfLineAdded = c.node.additions;
                commit.numberOfLineRemoved = c.node.deletions;
                commit.numberOfLineModified =
                  c.node.additions - c.node.deletions;
                return commit;
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
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllCommitsOfAllReposOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllCommitsOfAllReposOfUserWithPaginationQuery>({
          query: GetAllCommitsOfAllReposOfUserWithPagination,
          variables: {
            cursorRepo: repoEndCursor,
            date,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.repositories.pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.repositories.edges
        .filter((r) => !r.node.isInOrganization)
        .map((r) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;

          if (r.node.defaultBranchRef?.target.__typename === 'Commit') {
            const commits: Commit[] =
              r.node.defaultBranchRef.target.history.edges.map(
                (c: Record<string, any>) => {
                  const commit = new Commit();
                  commit.id = c.node.id;
                  commit.repoId = r.node.id;
                  commit.author = c.node.author.name;
                  commit.date = c.node.committedDate;
                  commit.numberOfLineAdded = c.node.additions;
                  commit.numberOfLineRemoved = c.node.deletions;
                  commit.numberOfLineModified =
                    c.node.additions - c.node.deletions;

                  return commit;
                },
              );
            repo.commits = commits;
          }
          this.upsert(repo.id, repo);
          return repo;
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    let issueEndCursor: string = null;
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();
    let graphQLResultWithPagination: ApolloQueryResult<GetAllIssuesOfAllReposOfAllOrgWithPaginationQuery>;

    await Promise.all([
      ...allRepos.map(async (r) => {
        do {
          graphQLResultWithPagination = await this.apolloService
            .githubClient()
            .query<GetAllIssuesOfAllReposOfAllOrgWithPaginationQuery>({
              query: GetAllIssuesOfAllReposOfAllOrgWithPagination,
              variables: {
                orgLogin: r.organization,
                name: r.name,
                cursorIssue: issueEndCursor,
              },
            });

          issueEndCursor =
            graphQLResultWithPagination.data.viewer.organization.repository
              .issues.pageInfo.endCursor;
          const issues: Issue[] =
            graphQLResultWithPagination.data.viewer.organization.repository.issues.edges.map(
              (i) => {
                const issue: Issue = new Issue();
                issue.id = i.node.id;
                issue.repoId = r.id;
                issue.state = i.node.state;
                issue.createdAt = i.node.createdAt;
                issue.closedAt = i.node.closedAt;

                return issue;
              },
            );
          r.issues = issues;
        } while (
          graphQLResultWithPagination.data.viewer.organization.repository.issues
            .pageInfo.hasNextPage
        );
        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getIssuesOfAllRepoOfUserWithPagination(): Promise<void> {
    let repoEndCursor: string = null;
    let issueEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllIssuesOfAllRepoOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllIssuesOfAllRepoOfUserWithPaginationQuery>({
          query: GetAllIssuesOfAllRepoOfUserWithPagination,
          variables: {
            cursorRepo: repoEndCursor,
            cursorIssue: issueEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.repositories.pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.repositories.edges
        .filter((r: Record<string, any>) => !r.node.isInOrganization)
        .map((r) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          let issuesList: Issue[] = [];

          do {
            issueEndCursor = r.node.issues.pageInfo.endCursor;
            const issues: Issue[] = r.node.issues.edges.map((i) => {
              const issue: Issue = new Issue();
              issue.id = i.node.id;
              issue.repoId = r.node.id;
              issue.state = i.node.state;
              issue.createdAt = i.node.createdAt;
              issue.closedAt = i.node.closedAt;

              return issue;
            });
            issuesList = issuesList.concat(issues);
          } while (r.node.issues.pageInfo.hasNextPage);
          repo.issues = issuesList;
          this.upsert(repo.id, repo);
          return repo;
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    let pullRequestEndCursor: string = null;
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();
    let graphQLResultWithPagination: ApolloQueryResult<GetAllPullRequestsOfAllReposOfAllOrgWithPaginationQuery>;

    await Promise.all([
      ...allRepos.map(async (r) => {
        do {
          graphQLResultWithPagination = await this.apolloService
            .githubClient()
            .query<GetAllPullRequestsOfAllReposOfAllOrgWithPaginationQuery>({
              query: GetAllPullRequestsOfAllReposOfAllOrgWithPagination,
              variables: {
                orgLogin: r.organization,
                name: r.name,
                cursorPullRequest: pullRequestEndCursor,
              },
            });

          pullRequestEndCursor =
            graphQLResultWithPagination.data.viewer.organization.repository
              .pullRequests.pageInfo.endCursor;
          const pullRequests: PullRequest[] =
            graphQLResultWithPagination.data.viewer.organization.repository.pullRequests.edges.map(
              (p) => {
                const pullRequest: PullRequest = new PullRequest();
                pullRequest.id = p.node.id;
                pullRequest.repoId = r.id;
                pullRequest.state = p.node.state;
                pullRequest.createdAt = p.node.createdAt;
                pullRequest.closedAt = p.node.closedAt;

                return pullRequest;
              },
            );
          r.pullRequests = pullRequests;
        } while (
          graphQLResultWithPagination.data.viewer.organization.repository
            .pullRequests.pageInfo.hasNextPage
        );

        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<void> {
    let repoEndCursor: string = null;
    let pullRequestEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllPullRequestsOfAllRepoOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllPullRequestsOfAllRepoOfUserWithPaginationQuery>({
          query: GetAllPullRequestsOfAllRepoOfUserWithPagination,
          variables: {
            cursorRepo: repoEndCursor,
            cursorPullRequest: pullRequestEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.repositories.pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.repositories.edges
        .filter((r: Record<string, any>) => !r.node.isInOrganization)
        .map((r) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          let pullRequestsList: PullRequest[] = [];

          do {
            pullRequestEndCursor = r.node.pullRequests.pageInfo.endCursor;
            const pullRequests: PullRequest[] = r.node.pullRequests.edges.map(
              (p) => {
                const pullRequest: PullRequest = new PullRequest();
                pullRequest.id = p.node.id;
                pullRequest.repoId = r.node.id;
                pullRequest.state = p.node.state;
                pullRequest.createdAt = p.node.createdAt;
                pullRequest.closedAt = p.node.closedAt;

                return pullRequest;
              },
            );
            pullRequestsList = pullRequestsList.concat(pullRequests);
          } while (r.node.pullRequests.pageInfo.hasNextPage);
          repo.pullRequests = pullRequestsList;
          this.upsert(repo.id, repo);
          return repo;
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { Issue } from 'src/entities/issue.entity';
import { Commit } from 'src/entities/commit.entity';
import {
  GetAllCommitsOfAllReposOfAllOrg,
  GetAllCommitsOfAllReposOfAllOrgQuery,
  GetAllCommitsOfAllReposOfUser,
  GetAllCommitsOfAllReposOfUserQuery,
  GetAllIssuesOfAllReposOfAllOrg,
  GetAllIssuesOfAllReposOfAllOrgQuery,
  GetAllIssuesOfAllReposOfUser,
  GetAllIssuesOfAllReposOfUserQuery,
  GetAllOrgsWithPagination,
  GetAllOrgsWithPaginationQuery,
  GetAllPullRequestOfAllReposOfAllOrg,
  GetAllPullRequestOfAllReposOfAllOrgQuery,
  GetAllPullRequestOfAllReposOfUser,
  GetAllPullRequestOfAllReposOfUserQuery,
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
  GetAllIssuesOfUserWithPaginationQuery,
  GetAllIssuesOfUserWithPagination,
} from 'src/generated/graphql';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { ApolloService } from '../apollo-client/apollo.service';
import { GithubService } from '../github/github.service';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { ApolloQueryResult } from '@apollo/client';

interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

@Injectable()
export class RepoService {
  apolloService: ApolloService;
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,

    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,

    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,

    @InjectRepository(PullRequest)
    private pullRequestRepository: Repository<PullRequest>,

    private readonly githubService: GithubService,
  ) {}

  auth(token: string): void {
    this.apolloService = new ApolloService(token);
  }

  findAll(): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        commits: true,
      },
    });
  }

  findAllByOrg(organization: string | null): Promise<Repo[]> {
    console.log({
      relations: {
        commits: true,
      },
      where: {
        organization,
      },
    });
    return this.repoRepository.find({
      relations: {
        commits: true,
      },
      where: {
        organization,
      },
    });
  }

  findAllByRepo(repoName: string): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        commits: true,
      },
      where: {
        repoName,
      },
    });
  }

  findIssuesByOrgByRepos(
    userId: string,
    organization: string | null,
    repoNames: string[],
  ): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        issues: true,
      },
      where: {
        repoName: In(Object.values(repoNames || {})),
        organization,
        users: {
          id: userId,
        },
      },
    });
  }

  findPullRequestsByOrgByRepos(
    userId: string,
    organization: string | null,
    repoNames: string[],
  ): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        pullRequests: true,
      },
      where: {
        repoName: In(Object.values(repoNames || {})),
        organization,
        users: {
          id: userId,
        },
      },
    });
  }

  findByOrgByReposAndTime(
    userId: string,
    organization: string | null,
    repoNames: string[],
    time: string,
  ): Promise<Repo[]> {
    const date = new Date();
    switch (time) {
      case 'last day':
        date.setHours(date.getHours() - 24);
        break;

      case 'last week':
        date.setHours(date.getHours() - 168);
        break;

      case 'last month':
        date.setMonth(date.getMonth() - 1);
        break;

      case 'last 3 months':
        date.setMonth(date.getMonth() - 3);
        break;

      case 'last 6 months':
        date.setMonth(date.getMonth() - 6);
        break;
    }
    return this.repoRepository.find({
      relations: {
        commits: true,
      },
      where: {
        repoName: In(Object.values(repoNames || {})),
        organization,
        commits: { date: MoreThanOrEqual(date) },
        users: {
          id: userId,
        },
      },
    });
  }

  async saveRepos(repos: Repo[]): Promise<void> {
    await this.repoRepository.save(repos);
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

  async getCommitsOfAllRepoOfAllOrg(date: Date): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllCommitsOfAllReposOfAllOrgQuery>({
        query: GetAllCommitsOfAllReposOfAllOrg,
        variables: {
          date,
        },
      });

    return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
      o.node.repositories.edges.map((r) => {
        const repo: Repo = new Repo();
        repo.organization = o.node.login;
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        if (r.node.defaultBranchRef.target.__typename === 'Commit') {
          const commits: Commit[] =
            r.node.defaultBranchRef.target.history.edges?.map((c) => {
              const commit = new Commit();
              commit.id = c.node.id;
              commit.repoId = repo.id;
              commit.author = c.node.author.name;
              commit.date = c.node.committedDate;
              commit.numberOfLineAdded = c.node.additions;
              commit.numberOfLineRemoved = c.node.deletions;
              commit.numberOfLineModified = c.node.additions - c.node.deletions;

              return commit;
            });

          this.commitRepository.save(commits);
          repo.commits = commits;
        }
        this.upsert(repo.id, repo);
        return repo;
      }),
    );
  }

  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<Repo[]> {
    const repositories: Repo[] = [];
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();

    await Promise.all([
      ...allRepos.map(async (r) => {
        const graphQLResultWithPagination = await this.apolloService
          .githubClient()
          .query<GetAllCommitsOfAllReposOfAllOrgWithPaginationQuery>({
            query: GetAllCommitsOfAllReposOfAllOrgWithPagination,
            variables: {
              orgLogin: r.organization,
              repoName: r.repoName,
              date,
            },
          });

        if (
          graphQLResultWithPagination.data.viewer.organization.repository
            .defaultBranchRef.target.__typename === 'Commit'
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
          this.commitRepository.save(commits);
          r.commits = commits;
        }

        repositories.push(r);
        this.upsert(r.id, r);
        return r;
      }),
    ]);

    return repositories;
  }

  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
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
                repoName: r.repoName,
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
          this.issueRepository.save(issues);
          r.issues = issues;
        } while (
          graphQLResultWithPagination.data.viewer.organization.repository.issues
            .pageInfo.hasNextPage
        );
        repositories.push(r);
        this.upsert(r.id, r);
        return r;
      }),
    ]);
    return repositories;
  }

  async getIssueOfAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let issueEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllIssuesOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllIssuesOfUserWithPaginationQuery>({
          query: GetAllIssuesOfUserWithPagination,
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
          repo.repoName = r.node.name;
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
          this.issueRepository.save(issuesList);
          repo.issues = issuesList;
          this.upsert(repo.id, repo);
          repositories.push(repo);
          return repo;
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );

    return repositories;
  }

  async getIssuesOfAllRepoOfAllOrg(): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllIssuesOfAllReposOfAllOrgQuery>({
        query: GetAllIssuesOfAllReposOfAllOrg,
      });

    return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
      o.node.repositories.edges.map((r) => {
        const repo: Repo = new Repo();
        repo.organization = o.node.login;
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        const issues: Issue[] = r.node.issues.edges.map((i) => {
          const issue = new Issue();
          issue.id = i.node.id;
          issue.repoId = repo.id;
          issue.state = i.node.state;

          if (i.node.createdAt) {
            issue.createdAt = i.node.createdAt;
          }

          if (i.node.closedAt) {
            issue.closedAt = i.node.closedAt;
          }

          return issue;
        });

        this.issueRepository.save(issues);
        repo.issues = issues;
        this.upsert(repo.id, repo);
        return repo;
      }),
    );
  }

  async getPullRequestsOfAllRepoOfAllOrg(): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllPullRequestOfAllReposOfAllOrgQuery>({
        query: GetAllPullRequestOfAllReposOfAllOrg,
      });

    return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
      o.node.repositories.edges.map((r) => {
        const repo: Repo = new Repo();
        repo.organization = o.node.login;
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        const pullRequests: PullRequest[] = r.node.pullRequests.edges.map(
          (p) => {
            const pullRequest = new PullRequest();
            pullRequest.id = p.node.id;
            pullRequest.repoId = repo.id;
            pullRequest.state = p.node.state;

            if (p.node.createdAt) {
              pullRequest.createdAt = p.node.createdAt;
            }

            if (p.node.closedAt) {
              pullRequest.closedAt = p.node.closedAt;
            }

            return pullRequest;
          },
        );

        this.pullRequestRepository.save(pullRequests);
        repo.pullRequests = pullRequests;
        this.upsert(repo.id, repo);
        return repo;
      }),
    );
  }

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
              repo.repoName = r.node.name;
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
          repo.repoName = r.node.name;
          repositories.push(repo);
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );

    return repositories;
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllPullRequestOfAllReposOfUserQuery>({
        query: GetAllPullRequestOfAllReposOfUser,
      });

    return graphQLResult.data.viewer.repositories.edges
      .filter((r) => r.node.isInOrganization === false)
      .map((r) => {
        const repo: Repo = new Repo();
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        const pullRequests: PullRequest[] = r.node.pullRequests.edges.map(
          (p) => {
            const pullRequest = new PullRequest();
            pullRequest.id = p.node.id;
            pullRequest.repoId = repo.id;
            pullRequest.state = p.node.state;
            if (p.node.createdAt) {
              pullRequest.createdAt = p.node.createdAt;
            }
            if (p.node.closedAt) {
              pullRequest.closedAt = p.node.closedAt;
            }
            return pullRequest;
          },
        );
        this.pullRequestRepository.save(pullRequests);
        repo.pullRequests = pullRequests;
        this.upsert(repo.id, repo);
        return repo;
      });
  }

  async getCommitsOfAllRepoOfUser(date: Date): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllCommitsOfAllReposOfUserQuery>({
        query: GetAllCommitsOfAllReposOfUser,
        variables: {
          date,
        },
      });

    return graphQLResult.data.viewer.repositories.edges
      .filter((r) => r.node.isInOrganization === false)
      .map((r) => {
        const repo: Repo = new Repo();
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        if (r.node.defaultBranchRef?.target.__typename === 'Commit') {
          const commits: Commit[] =
            r.node.defaultBranchRef.target.history.edges?.map((c) => {
              const commit = new Commit();
              commit.id = c.node.id;
              commit.repoId = repo.id;
              commit.author = c.node.author.name;
              commit.date = c.node.committedDate;
              commit.numberOfLineAdded = c.node.additions;
              commit.numberOfLineRemoved = c.node.deletions;
              commit.numberOfLineModified = c.node.additions - c.node.deletions;

              return commit;
            });
          this.commitRepository.save(commits);
          repo.commits = commits;
        }

        this.upsert(repo.id, repo);
        return repo;
      });
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<void> {
    const repositories: Repo[] = [];
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
          repo.repoName = r.node.name;

          if (r.node.defaultBranchRef.target.__typename === 'Commit') {
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
            this.commitRepository.save(commits);
            repo.commits = commits;
          }
          this.upsert(repo.id, repo);
          repositories.push(repo);
          return repo;
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );
  }

  async getIssuesOfAllRepoOfUser(): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllIssuesOfAllReposOfUserQuery>({
        query: GetAllIssuesOfAllReposOfUser,
      });

    return graphQLResult.data.viewer.repositories.edges
      .filter((r) => r.node.isInOrganization === false)
      .map((r) => {
        const repo: Repo = new Repo();
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        const issues: Issue[] = r.node.issues.edges.map((i) => {
          const issue = new Issue();
          issue.id = i.node.id;
          issue.repoId = repo.id;
          issue.state = i.node.state;
          if (i.node.createdAt) {
            issue.createdAt = i.node.createdAt;
          }
          if (i.node.closedAt) {
            issue.closedAt = i.node.closedAt;
          }
          return issue;
        });
        this.issueRepository.save(issues);
        repo.issues = issues;
        this.upsert(repo.id, repo);
        return repo;
      });
  }

  async getPullRequestsOfAllRepoOfUser(): Promise<Repo[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllPullRequestOfAllReposOfUserQuery>({
        query: GetAllPullRequestOfAllReposOfUser,
      });

    return graphQLResult.data.viewer.repositories.edges
      .filter((r) => r.node.isInOrganization === false)
      .map((r) => {
        const repo: Repo = new Repo();
        repo.repoName = r.node.name;
        repo.id = r.node.id;

        const pullRequests: PullRequest[] = r.node.pullRequests.edges.map(
          (p) => {
            const pullRequest = new PullRequest();
            pullRequest.id = p.node.id;
            pullRequest.repoId = repo.id;
            pullRequest.state = p.node.state;
            if (p.node.createdAt) {
              pullRequest.createdAt = p.node.createdAt;
            }
            if (p.node.closedAt) {
              pullRequest.closedAt = p.node.closedAt;
            }
            return pullRequest;
          },
        );
        this.pullRequestRepository.save(pullRequests);
        repo.pullRequests = pullRequests;
        this.upsert(repo.id, repo);
        return repo;
      });
  }

  async syncIssuesForAllRepoOfAllOrgs(date: Date): Promise<void> {
    const orgs = await this.githubService.getAllOrganizations();
    const profile = await this.githubService.getProfile();
    const issues = (
      await Promise.all([
        ...orgs.map((org) => this.githubService.getOrgIssues(org.login, date)),
        this.githubService.getUserIssues(profile.login, date),
      ])
    ).flatMap((i) =>
      i.map((j) => ({
        ...j,
        repositoryName: j.repository_url.split('/').pop(),
      })),
    );

    const existingRepos = await this.repoRepository.findBy({
      repoName: In(issues.map((i) => i.repositoryName)),
      organization: In([...orgs.map((o) => o.login), profile.login]),
    });

    const issuesDb = issues.map((i) => {
      const issueDb = new Issue();
      issueDb.id = i.node_id;
      issueDb.createdAt = i.created_at;
      if (i.closed_at) {
        issueDb.closedAt = i.closed_at;
      }
      issueDb.state = i.state;
      issueDb.repo = existingRepos.find((r) => r.repoName === i.repositoryName);
      return issueDb;
    });

    await this.issueRepository.save(issuesDb);
  }
}

//ref(qualifiedName: "master")

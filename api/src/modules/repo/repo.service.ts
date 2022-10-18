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
  GetAllOrgsV2,
  GetAllOrgsV2Query,
  GetAllOrgsWithPagination,
  GetAllOrgsWithPaginationQuery,
  GetAllPullRequestOfAllReposOfAllOrg,
  GetAllPullRequestOfAllReposOfAllOrgQuery,
  GetAllPullRequestOfAllReposOfUser,
  GetAllPullRequestOfAllReposOfUserQuery,
  GetAllReposOfOrgWithPagination,
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfOrgV2Query,
  GetAllReposOfOrgV2,
  GetAllReposOfUserWithPaginationQuery,
  GetAllReposOfUserWithPagination,
  GetAllReposOfUserV2Query,
  GetAllReposOfUserV2,
} from 'src/generated/graphql';
import { In, MoreThanOrEqual, Repository } from 'typeorm';
import { ApolloService } from '../apollo-client/apollo.service';
import { GithubService } from '../github/github.service';
import { PullRequest } from 'src/entities/pullrequest.entity';

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

  findAllByOrg(organization: string): Promise<Repo[]> {
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
    organization: string,
    repoNames: string[],
  ): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        issues: true,
      },
      where: {
        repoName: In(Object.values(repoNames || {})),
        organization,
      },
    });
  }

  findPullRequestsByOrgByRepos(
    organization: string,
    repoNames: string[],
  ): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        pullRequests: true,
      },
      where: {
        repoName: In(Object.values(repoNames || {})),
        organization,
      },
    });
  }

  findByOrgByReposAndTime(
    organization: string,
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
      },
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
    let organizations: Organization[] = [];
    let orgEndCursor: string;

    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllOrgsV2Query>({
        query: GetAllOrgsV2,
      });

    graphQLResult.data.viewer.organizations.edges.map((o) => {
      organizations.push({
        id: o.node.id,
        login: o.node.login,
        databaseId: o.node.databaseId,
      });
    });

    if (graphQLResult.data.viewer.organizations.pageInfo.hasNextPage) {
      let graphQLResultWithPagination: any;
      do {
        orgEndCursor =
          graphQLResult.data.viewer.organizations.pageInfo.endCursor;
        graphQLResultWithPagination = await this.apolloService
          .githubClient()
          .query<GetAllOrgsWithPaginationQuery>({
            query: GetAllOrgsWithPagination,
            variables: {
              cursorOrg: orgEndCursor,
            },
          });

        graphQLResultWithPagination.data.viewer.organizations.edges.map((o) => {
          organizations.push({
            id: o.node.id,
            login: o.node.login,
            databaseId: o.node.databaseId,
          });
        });
      } while (
        graphQLResultWithPagination.data.viewer.organizations.pageInfo
          .hasNextPage
      );
    }

    return organizations;

    /* return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
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
    ); */
  }

  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    let repositories: Repo[] = [];
    let repoEndCursor: string;
    let allOrgs = await this.getAllOrgWithPagination();

    await Promise.all([
      ...allOrgs.map(async (o) => {
        const graphQLResult = await this.apolloService
          .githubClient()
          .query<GetAllReposOfOrgV2Query>({
            query: GetAllReposOfOrgV2,
            variables: {
              orgLogin: o.login,
            },
          });

        graphQLResult.data.viewer.organization.repositories.edges.map(
          (r: Record<string, any>) => {
            const repo: Repo = new Repo();
            repo.id = r.node.id;
            repo.repoName = r.node.name;
            repo.organization = o.login;

            repositories.push(repo);
          },
        );

        if (
          graphQLResult.data.viewer.organization.repositories.pageInfo
            .hasNextPage
        ) {
          let graphQLResultWithPagination: any;

          do {
            repoEndCursor =
              graphQLResult.data.viewer.organization.repositories.pageInfo
                .endCursor;
            graphQLResultWithPagination = await this.apolloService
              .githubClient()
              .query<GetAllReposOfOrgWithPaginationQuery>({
                query: GetAllReposOfOrgWithPagination,
                variables: {
                  orgLogin: o.login,
                  cursorRepo: repoEndCursor,
                },
              });

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
        }
      }),
    ]);
    this.repoRepository.save(repositories);
    return repositories;

    /* return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
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
    ); */
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
    let repositories: Repo[] = [];
    let repoEndCursor: string;

    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllReposOfUserV2Query>({
        query: GetAllReposOfUserV2,
      });

    graphQLResult.data.viewer.repositories.edges
      .filter((r) => !r.node.isInOrganization)
      .map((r: Record<string, any>) => {
        const repo: Repo = new Repo();
        repo.id = r.node.id;
        repo.repoName = r.node.name;
        repo.organization = graphQLResult.data.viewer.login;

        repositories.push(repo);
      });

    if (graphQLResult.data.viewer.repositories.pageInfo.hasNextPage) {
      let graphQLResultWithPagination: any;

      do {
        repoEndCursor =
          graphQLResult.data.viewer.repositories.pageInfo.endCursor;
        graphQLResultWithPagination = await this.apolloService
          .githubClient()
          .query<GetAllReposOfUserWithPaginationQuery>({
            query: GetAllReposOfUserWithPagination,
            variables: {
              cursorRepo: repoEndCursor,
            },
          });

        graphQLResultWithPagination.data.viewer.organization.repositories.edges.map(
          (r: Record<string, any>) => {
            const repo: Repo = new Repo();
            repo.id = r.node.id;
            repo.repoName = r.node.name;
            repo.organization = graphQLResult.data.viewer.login;

            repositories.push(repo);
          },
        );
      } while (
        graphQLResultWithPagination.data.viewer.organization.repositories
          .pageInfo.hasNextPage
      );
    }
    this.repoRepository.save(repositories);
    return repositories;

    /* return graphQLResult.data.viewer.organizations.edges?.flatMap((o) =>
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
    ); */
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
        repo.organization = graphQLResult.data.viewer.login;
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
        repo.organization = graphQLResult.data.viewer.login;
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
        repo.organization = graphQLResult.data.viewer.login;
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
        repo.organization = graphQLResult.data.viewer.login;
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

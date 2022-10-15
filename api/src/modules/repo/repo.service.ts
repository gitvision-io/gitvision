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
} from 'src/generated/graphql';
import { In, Repository } from 'typeorm';
import { ApolloService } from '../apollo-client/apollo.service';
import { GithubService } from '../github/github.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class RepoService {
  apolloService: ApolloService;
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,

    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,

    @InjectRepository(Issue)
    private IssueRepository: Repository<Issue>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

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

  findByOrgByRepos(organization, repoNames: string[]): Promise<Repo[]> {
    return this.repoRepository.find({
      relations: {
        commits: true,
      },
      where: {
        repoName: In(Object.values(repoNames)),
        organization,
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
              commit.commitId = c.node.id;
              commit.repoId = repo.id;
              commit.author = c.node.author.name;
              commit.date = c.node.committedDate;
              commit.numberOfLineAdded = c.node.additions;
              commit.numberOfLineRemoved = c.node.deletions;
              commit.numberOfLineModified = c.node.additions - c.node.deletions;

              this.commitRepository.save(commit);
              return commit;
            });
          repo.commits = commits;
        }

        this.upsert(repo.id, repo);
        return repo;
      }),
    );
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

    return graphQLResult.data.viewer.repositories.edges?.map((r) => {
      const repo: Repo = new Repo();
      repo.organization = graphQLResult.data.viewer.login;
      repo.repoName = r.node.name;
      repo.id = r.node.id;

      if (r.node.defaultBranchRef.target.__typename === 'Commit') {
        const commits: Commit[] =
          r.node.defaultBranchRef.target.history.edges?.map((c) => {
            const commit = new Commit();
            commit.commitId = c.node.id;
            commit.repoId = repo.id;
            commit.author = c.node.author.name;
            commit.date = c.node.committedDate;
            commit.numberOfLineAdded = c.node.additions;
            commit.numberOfLineRemoved = c.node.deletions;
            commit.numberOfLineModified = c.node.additions - c.node.deletions;

            this.commitRepository.save(commit);
            return commit;
          });
        repo.commits = commits;
      }

      this.upsert(repo.id, repo);
      return repo;
    });
  }

  async syncIssuesForAllRepoOfOrg(org: string): Promise<void> {
    const issues = (await this.githubService.getOrgIssues(org)).filter((i) =>
      Boolean(i.repository),
    );
    const existingRepos = await this.repoRepository.findBy({
      repoName: In(issues.map((i) => i.repository.name)),
      organization: org,
    });

    const issuesDb = issues.map((i) => {
      const issueDb = new Issue();
      issueDb.id = i.node_id;
      if (i.closed_by) {
        issueDb.closedBy = i.closed_by.login;
      }
      issueDb.createdAt = i.created_at;
      if (i.closed_at) {
        issueDb.closedAt = i.closed_at;
      }
      issueDb.repoId = i.repository?.node_id;
      issueDb.state = i.state;

      let repo = existingRepos.find((r) => r.repoName === i.repository.name);
      if (!repo) {
        repo = new Repo();
        repo.organization = org;
        repo.repoName = i.repository.name;
      }
      issueDb.repo = repo;
      return issueDb;
    });

    await this.IssueRepository.save(issuesDb);
  }

  async syncIssuesForAllRepoOfAllOrgs(): Promise<void> {
    const orgs = await this.githubService.getAllOrganizations();
    await Promise.all(orgs.map((o) => this.syncIssuesForAllRepoOfOrg(o.login)));
  }
}

//ref(qualifiedName: "master")

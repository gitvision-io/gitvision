import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepoStats } from 'src/entities/repoStats.entity';
import { Issue } from 'src/entities/issue.entity';
import { UserRepoStats } from 'src/entities/userRepoStats.entity';
import {
  GetAllCommitsOfAllReposOfAllOrg,
  GetAllCommitsOfAllReposOfAllOrgQuery,
} from 'src/generated/graphql';
import { In, Repository } from 'typeorm';
import { ApolloService } from '../apollo-client/apollo.service';
import { GithubService } from '../github/github.service';
import { RepoStatsDTO } from './repoStats.dto';

@Injectable()
export class RepoStatsService {
  apolloService: ApolloService;
  constructor(
    @InjectRepository(RepoStats)
    private reposStatsRepository: Repository<RepoStats>,

    @InjectRepository(UserRepoStats)
    private userRepoStatsRepository: Repository<UserRepoStats>,

    @InjectRepository(Issue)
    private IssueRepository: Repository<Issue>,

    private readonly githubService: GithubService,
  ) {}

  auth(token: string): void {
    this.apolloService = new ApolloService(token);
  }

  findAll(): Promise<RepoStats[]> {
    return this.reposStatsRepository.find({
      relations: {
        usersRepoStats: true,
      },
    });
  }

  findAllByOrg(organization: string): Promise<RepoStats[]> {
    return this.reposStatsRepository.find({
      relations: {
        usersRepoStats: true,
      },
      where: {
        organization,
      },
    });
  }

  findAllByRepo(repoName: string): Promise<RepoStats[]> {
    return this.reposStatsRepository.find({
      relations: {
        usersRepoStats: true,
      },
      where: {
        repoName,
      },
    });
  }

  findByOrgByRepo(organization, repoName: string): Promise<RepoStats> {
    return this.reposStatsRepository.findOne({
      relations: {
        usersRepoStats: true,
      },
      where: {
        repoName,
        organization,
      },
    });
  }

  async upsert(id: string, repoStats: RepoStats): Promise<void> {
    await this.reposStatsRepository.upsert(
      {
        id,
        ...repoStats,
      },
      ['id'],
    );
  }

  async upsertUserStats(
    id: string,
    userRepoStats: UserRepoStats,
  ): Promise<void> {
    await this.userRepoStatsRepository.upsert(
      {
        commitId: id,
        ...userRepoStats,
      },
      ['commitId'],
    );
  }

  async update(id: string, repoStatsDTO: RepoStatsDTO): Promise<void> {
    await this.reposStatsRepository.update(id, repoStatsDTO);
  }

  async remove(id: string): Promise<void> {
    await this.reposStatsRepository.delete({ id });
  }

  async getCommitsOfAllRepoOfAllOrg(): Promise<RepoStats[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllCommitsOfAllReposOfAllOrgQuery>({
        query: GetAllCommitsOfAllReposOfAllOrg,
      });

    let reposStats: RepoStats[];

    graphQLResult.data.viewer.organizations.edges.map((o) => {
      reposStats = o.node.repositories.edges.map((r) => {
        const repoStats: RepoStats = new RepoStats();
        repoStats.organization = o.node.login;
        repoStats.repoName = r.node.name;
        repoStats.id = r.node.id;

        if (r.node.defaultBranchRef.target.__typename === 'Commit') {
          repoStats.numberOfCommits =
            r.node.defaultBranchRef.target.history.edges.length;
          const usersRepoStats: UserRepoStats[] =
            r.node.defaultBranchRef.target.history.edges.map((c) => {
              const userRepoStats = new UserRepoStats();
              userRepoStats.commitId = c.node.id;
              userRepoStats.repoId = repoStats.id;
              userRepoStats.author = c.node.author.name;
              userRepoStats.date = c.node.committedDate;
              userRepoStats.numberOfLineAdded = c.node.additions;
              userRepoStats.numberOfLineRemoved = c.node.deletions;
              userRepoStats.numberOfLineModified =
                c.node.additions - c.node.deletions;

              this.userRepoStatsRepository.save(userRepoStats);
              return userRepoStats;
            });
          repoStats.usersRepoStats = usersRepoStats;
        }

        this.reposStatsRepository.save(repoStats);
        return repoStats;
      });
    });
    return reposStats;
  }

  async syncIssuesForAllRepoOfOrg(org: string): Promise<void> {
    const issues = (await this.githubService.getOrgIssues(org)).filter((i) =>
      Boolean(i.repository),
    );
    const existingRepoStats = await this.reposStatsRepository.findBy({
      repoName: In(issues.map((i) => i.repository.name)),
      organization: org,
    });

    const issuesDb = issues.map((i) => {
      const issueDb = new Issue();
      if (i.closed_by) {
        issueDb.closedBy = i.closed_by.login;
      }
      issueDb.createdAt = i.created_at;
      if (i.closed_at) {
        issueDb.closedAt = i.closed_at;
      }
      issueDb.repoId = i.repository?.node_id;
      issueDb.state = i.state;

      let repoStats = existingRepoStats.find(
        (r) => r.repoName === i.repository.name,
      );
      if (!repoStats) {
        repoStats = new RepoStats();
        repoStats.numberOfCommits = 0;
        repoStats.organization = org;
        repoStats.repoName = i.repository.name;
      }
      issueDb.repoStats = repoStats;
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

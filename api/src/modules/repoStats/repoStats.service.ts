import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RepoStats } from 'src/entities/repoStats.entity';
import { UserRepoStats } from 'src/entities/userRepoStats.entity';
import {
  GetAllCommitsOfAllReposOfAllOrg,
  GetAllCommitsOfAllReposOfAllOrgQuery,
} from 'src/generated/graphql';
import { Repository } from 'typeorm';
import { ApolloService } from '../apollo-client/apollo.service';
import { RepoStatsDTO, UserRepoStatsDTO } from './repoStats.dto';

@Injectable()
export class RepoStatsService {
  apolloService: ApolloService;
  constructor(
    @InjectRepository(RepoStats)
    private reposStatsRepository: Repository<RepoStats>,

    @InjectRepository(UserRepoStats)
    private userRepoStatsRepository: Repository<UserRepoStats>,
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

        switch (r.node.defaultBranchRef.target.__typename) {
          case 'Commit':
            repoStats.numberOfCommits =
              r.node.defaultBranchRef.target.history.edges.length;
            let usersRepoStats: UserRepoStats[] =
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
}

//ref(qualifiedName: "master")

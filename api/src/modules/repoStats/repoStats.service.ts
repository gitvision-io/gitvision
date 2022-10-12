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
    return this.reposStatsRepository.find();
  }

  findOne(id: string): Promise<RepoStats> {
    return this.reposStatsRepository.findOneBy({ repoId: id });
  }

  async upsert(id: string, repoStatsDTO: RepoStatsDTO): Promise<void> {
    await this.reposStatsRepository.upsert(
      {
        repoId: id,
        ...repoStatsDTO,
      },
      ['id'],
    );
  }

  async upsertUserStats(
    id: string,
    userRepoStatsDTO: UserRepoStatsDTO,
  ): Promise<void> {
    await this.userRepoStatsRepository.upsert(
      {
        repoId: id,
        ...userRepoStatsDTO,
      },
      ['repoId'],
    );
  }

  async update(id: string, repoStatsDTO: RepoStatsDTO): Promise<void> {
    await this.reposStatsRepository.update(id, repoStatsDTO);
  }

  async remove(id: string): Promise<void> {
    await this.reposStatsRepository.delete({ repoId: id });
  }

  /*   async getCommitsOfRepo(
    organization: string,
    repoName: string,
  ): Promise<RepoStats> {
    const repoStats: RepoStats = new RepoStats();
    let usersRepoStats;

    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllCommitsOfRepoQuery>({
        query: GetAllCommitsOfRepo,
        variables: {
          login: organization,
          repoName: repoName,
        },
      });

    repoStats.organization = organization;
    repoStats.repoName = graphQLResult.data.organization.repository.name;
    repoStats.repoId = graphQLResult.data.organization.repository.id;

    const resTarget =
      graphQLResult.data.organization.repository.defaultBranchRef.target;

    switch (resTarget.__typename) {
      case 'Commit':
        usersRepoStats = resTarget.history.edges.map((c) => {
          const userRepoStats = new UserRepoStats();
          userRepoStats.id = c.node.id;
          userRepoStats.repoId = repoStats.repoId;
          userRepoStats.author = c.node.author.name;
          userRepoStats.date = c.node.committedDate;
          userRepoStats.numberOfLineAdded = c.node.additions;
          userRepoStats.numberOfLineRemoved = c.node.deletions;
          userRepoStats.numberOfLineModified =
            c.node.additions - c.node.deletions;

          this.upsertUserStats(userRepoStats.id, userRepoStats);

          return userRepoStats;
        });
    }

    repoStats.usersRepoStats = usersRepoStats;

    this.upsert(repoStats.repoId, repoStats);

    return repoStats;
  }
 */
  async getCommitsOfAllRepoOfAllOrg(): Promise<RepoStats[]> {
    const graphQLResult = await this.apolloService
      .githubClient()
      .query<GetAllCommitsOfAllReposOfAllOrgQuery>({
        query: GetAllCommitsOfAllReposOfAllOrg,
      });

    let reposStats: RepoStats[];

    graphQLResult.data.viewer.organizations.edges.map((o) => {
      reposStats = o.node.repositories.edges.map((r) => {
        let usersRepoStats;
        const repoStats: RepoStats = new RepoStats();
        repoStats.organization = o.node.login;
        repoStats.repoName = r.node.name;
        repoStats.repoId = r.node.id;

        switch (r.node.defaultBranchRef.target.__typename) {
          case 'Commit':
            usersRepoStats = r.node.defaultBranchRef.target.history.edges.map(
              (c) => {
                const userRepoStats = new UserRepoStats();
                userRepoStats.repoId = repoStats.repoId;
                userRepoStats.author = c.node.author.name;
                userRepoStats.date = c.node.committedDate;
                userRepoStats.numberOfLineAdded = c.node.additions;
                userRepoStats.numberOfLineRemoved = c.node.deletions;
                userRepoStats.numberOfLineModified =
                  c.node.additions - c.node.deletions;

                this.upsertUserStats(userRepoStats.repoId, userRepoStats);
                return userRepoStats;
              },
            );
        }
        repoStats.usersRepoStats = usersRepoStats;

        this.upsert(repoStats.repoId, repoStats);
        return repoStats;
      });
    });
    return reposStats;
  }
}

//ref(qualifiedName: "master")

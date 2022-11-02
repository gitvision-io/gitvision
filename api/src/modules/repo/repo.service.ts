import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { Equal, In, IsNull, Not, Repository } from 'typeorm';
import { RepoGithubService } from './github/repo.github.service';
import { RepoGitlabService } from './gitlab/repo.gitlab.service';

export interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

export interface IRepoGitProvider {
  auth(token: string): void;
  getAllOrgWithPagination(): Promise<Organization[]>;
  getAllRepoOfAllOrgWithPagination(): Promise<Repo[]>;
  getAllRepoOfUserWithPagination(): Promise<Repo[]>;
  getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<Repo[]>;
  getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<Repo[]>;
  getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<Repo[]>;
  getIssuesOfAllRepoOfUserWithPagination(): Promise<Repo[]>;
  getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<Repo[]>;
  getPullRequestsOfAllRepoOfUserWithPagination(): Promise<Repo[]>;
}

@Injectable()
export class RepoService {
  #repoGitProvider: IRepoGitProvider;
  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  auth(providerName: string, token: string): void {
    if (providerName === 'github') {
      this.#repoGitProvider = new RepoGithubService();
    } else if (providerName === 'gitlab') {
      this.#repoGitProvider = new RepoGitlabService();
    }
    this.#repoGitProvider.auth(token);
  }

  async getAllOrganizations(userId: string): Promise<string[]> {
    return (
      await this.repoRepository
        .createQueryBuilder('repo')
        .innerJoin('repo.users', 'repoUsers', 'repoUsers.id = (:userId)', {
          userId,
        })
        .where({ organization: Not(IsNull()) })
        .select('organization')
        .distinct()
        .getRawMany()
    ).map((r: { organization: string }) => r.organization);
  }

  async getRepositories(
    userId: string,
    organization: string | null,
  ): Promise<string[]> {
    return (
      await this.repoRepository
        .createQueryBuilder('repo')
        .innerJoin('repo.users', 'repoUsers', 'repoUsers.id = (:userId)', {
          userId,
        })
        .select('repo.name')
        .where({
          organization: organization === null ? IsNull() : Equal(organization),
        })
        .distinct()
        .getRawMany()
    ).map((r) => r.repo_name);
  }

  findByOrgByReposAndTime(
    userId: string,
    organization: string | null,
    names: string[],
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

    return this.repoRepository
      .createQueryBuilder('repo')
      .innerJoinAndSelect('repo.commits', 'commits', 'commits.date >= :date', {
        date,
      })
      .leftJoinAndSelect('repo.issues', 'issues', 'issues.createdAt >= :date', {
        date,
      })
      .leftJoinAndSelect(
        'repo.pullRequests',
        'pullRequests',
        'pullRequests.createdAt >= :date',
        {
          date,
        },
      )
      .innerJoinAndSelect('repo.users', 'users', 'users.id = :userId', {
        userId,
      })
      .where({
        name: In(Object.values(names || {})),
        organization: organization === null ? IsNull() : organization,
      })
      .getMany();
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
    return await this.#repoGitProvider.getAllOrgWithPagination();
  }

  // Get all repositories
  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    return await this.#repoGitProvider.getAllRepoOfAllOrgWithPagination();
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
    return await this.#repoGitProvider.getAllRepoOfUserWithPagination();
  }

  // Get all commits
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<void> {
    const repos =
      await this.#repoGitProvider.getCommitsOfAllRepoOfAllOrgWithPagination(
        date,
      );
    this.repoRepository.save(repos);
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<void> {
    const repos =
      await this.#repoGitProvider.getCommitsOfAllRepoOfUserWithPagination(date);
    this.repoRepository.save(repos);
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    const repos =
      await this.#repoGitProvider.getIssuesOfAllRepoOfAllOrgWithPagination();
    this.repoRepository.save(repos);
  }

  async getIssuesOfAllRepoOfUserWithPagination(): Promise<void> {
    const repos =
      await this.#repoGitProvider.getIssuesOfAllRepoOfUserWithPagination();
    this.repoRepository.save(repos);
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    const repos =
      await this.#repoGitProvider.getPullRequestsOfAllRepoOfAllOrgWithPagination();
    this.repoRepository.save(repos);
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<void> {
    const repos =
      await this.#repoGitProvider.getPullRequestsOfAllRepoOfUserWithPagination();
    this.repoRepository.save(repos);
  }
}

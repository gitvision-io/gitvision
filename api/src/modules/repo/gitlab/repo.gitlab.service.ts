import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';

import { Repository } from 'typeorm';
import { Gitlab } from '@gitbeaker/node';

export interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

const defaultAPI = new Gitlab(null);

@Injectable()
export class RepoGitlabService {
  #api: typeof defaultAPI;

  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,
  ) {}

  auth(token: string): void {
    this.#api = new Gitlab({
      host: 'https://gitlab.com/api/v4',
      token,
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

  // Get all organisations
  async getAllOrgWithPagination(): Promise<Organization[]> {
    const organizations: Organization[] = [];
    console.log(this.#api.Groups.all({ maxPages: 50000 }));
    return organizations;
  }

  // Get all repositories
  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];

    return repositories;
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];

    return repositories;
  }

  // Get all commits
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<void> {
    return null;
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<void> {
    return null;
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    return null;
  }

  async getIssuesOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    return null;
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }
}

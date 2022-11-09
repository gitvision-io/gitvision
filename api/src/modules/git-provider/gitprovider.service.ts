import { Injectable } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { GithubService } from './github.service';
import { GitlabService } from './gitlab.service';
import { Organization } from 'src/common/types';
import { Commit } from 'src/entities/commit.entity';
import { Issue } from 'src/entities/issue.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';

export interface IGitProvider {
  auth(token: string): void;
  getProfile(): Promise<{ id: number; login: string }>;
  getOrgRepositories(org: string, onlyPublic: boolean): Promise<Repo[]>;

  getAllOrgs(): Promise<Organization[]>;
  getAllReposOfOrgs(orgs: Organization[]): Promise<Repo[]>;
  getAllReposOfUser(): Promise<Repo[]>;
  getCommitsOfRepos(repos: Repo[], date: Date): Promise<Commit[]>;
  getIssuesOfRepos(repos: Repo[], date: Date): Promise<Issue[]>;
  getPullRequestsOfRepos(repos: Repo[], date: Date): Promise<PullRequest[]>;
}

@Injectable()
export class GitProviderService {
  #gitProvider: IGitProvider;
  constructor() {}

  auth(providerName: string, token: string): void {
    if (providerName === 'github') {
      this.#gitProvider = new GithubService();
    } else if (providerName === 'gitlab') {
      this.#gitProvider = new GitlabService();
    }
    this.#gitProvider.auth(token);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    return await this.#gitProvider.getProfile();
  }

  async getAllOrgs(): Promise<Organization[]> {
    return await this.#gitProvider.getAllOrgs();
  }

  async getOrgRepositories(org: string, onlyPublic: boolean): Promise<Repo[]> {
    return await this.#gitProvider.getOrgRepositories(org, onlyPublic);
  }

  // Get all repositories
  async getAllRepoOfOrgs(orgs: Organization[]): Promise<Repo[]> {
    return await this.#gitProvider.getAllReposOfOrgs(orgs);
  }

  async getAllReposOfUser(): Promise<Repo[]> {
    return await this.#gitProvider.getAllReposOfUser();
  }

  // Get all commits
  async getCommitsOfRepos(repos: Repo[], date: Date): Promise<Commit[]> {
    return await this.#gitProvider.getCommitsOfRepos(repos, date);
  }

  // Get all issues
  async getIssuesOfRepos(repos: Repo[], date: Date): Promise<Issue[]> {
    return await this.#gitProvider.getIssuesOfRepos(repos, date);
  }

  // Get all pull requests
  async getPullRequestsOfRepos(
    repos: Repo[],
    date: Date,
  ): Promise<PullRequest[]> {
    return await this.#gitProvider.getPullRequestsOfRepos(repos, date);
  }
}

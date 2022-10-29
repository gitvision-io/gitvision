import { Injectable } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { GithubService } from '../github/github.service';
import { GitlabService } from '../gitlab/gitlab.service';

export interface IGitProvider {
  auth(token: string): void;
  getAllOrganizations(): Promise<{ id: number; login: string }[]>;
  getProfile(): Promise<{ id: number; login: string }>;
  getRepositories(): Promise<Repo[]>;
  getOrgRepositories(org: string): Promise<Repo[]>;
  revokeAccess(token: string): void;
}

@Injectable()
export class GitProviderService {
  #gitProvider: IGitProvider;
  #token: string;

  auth(providerName: string, token: string): void {
    this.#token = token;
    if (providerName === 'github') {
      this.#gitProvider = new GithubService();
    } else if (providerName === 'gitlab') {
      this.#gitProvider = new GitlabService();
    }
    this.#gitProvider.auth(token);
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<{ id: number; login: string }[]> {
    return await this.#gitProvider.getAllOrganizations();
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    return await this.#gitProvider.getProfile();
  }

  async getRepositories(): Promise<Repo[]> {
    return await this.#gitProvider.getRepositories();
  }

  async getOrgRepositories(org: string): Promise<Repo[]> {
    return await this.#gitProvider.getOrgRepositories(org);
  }

  async revokeAccess(token: string): Promise<void> {
    return this.#gitProvider.revokeAccess(token);
  }
}

import { Injectable } from '@nestjs/common';
import { Repo } from 'src/entities/repo.entity';
import { GithubService } from '../github/github.service';
import { GitlabService } from '../gitlab/gitlab.service';
import { HttpService } from '@nestjs/axios';

export interface IGitProvider {
  auth(token: string): void;
  getAllOrganizations(): Promise<string[]>;
  getProfile(): Promise<{ id: number; login: string }>;
  getRepositories(): Promise<Repo[]>;
  getOrgRepositories(org: string): Promise<Repo[]>;
  revokeAccess(token: string): void;
}

@Injectable()
export class GitProviderService {
  #gitProvider: IGitProvider;
  #token: string;
  constructor(private readonly httpService: HttpService) {}

  auth(providerName: string, token: string): void {
    this.#token = token;
    if (providerName === 'github') {
      this.#gitProvider = new GithubService();
    } else if (providerName === 'gitlab') {
      this.#gitProvider = new GitlabService(this.httpService);
    }
    this.#gitProvider.auth(token);
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<string[]> {
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

import { Injectable } from '@nestjs/common';
import { ApolloService } from '../apollo-client/apollo.service';
import { Repo } from 'src/entities/repo.entity';
import { Gitlab } from '@gitbeaker/node';
import { HttpService } from '@nestjs/axios';

export type GithubIssue = {
  id: number;
  node_id: string;
  state: string;
  created_at: string;
  closed_at: string;
  repository_url: string;
  comments?: number;
  org?: string;
};

const defaultAPI = new Gitlab(null);

@Injectable()
export class GitlabService {
  apolloService: ApolloService;
  #token: string;
  #api: typeof defaultAPI;

  constructor(private readonly httpService: HttpService) {}

  auth(token: string): void {
    this.#token = token;
    this.#api = new Gitlab({
      host: 'https://gitlab.com',
      oauthToken: token,
    });
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<string[]> {
    const orgs = await this.#api.Groups.all({ maxPages: 50000 });
    return orgs.flatMap((o) => o.full_path);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    const { id, username: login } = await this.#api.Users.current();
    return { id, login };
  }

  async getRepositories(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }

  async getOrgRepositories(org: string): Promise<Repo[]> {
    const repositories: Repo[] = [];
    return repositories;
  }

  async revokeAccess(token: string): Promise<void> {
    this.httpService.post('https://gitlab.com/oauth/revoke', {
      client_id: process.env.GITLAB_ID,
      client_secret: process.env.GITLAB_SECRET,
      token,
    });
  }
}

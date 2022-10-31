import { Injectable } from '@nestjs/common';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfOrgWithPagination,
} from 'src/generated/graphql';
import { ApolloQueryResult } from '@apollo/client';
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
    return orgs.flatMap((o) => o.name);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    const { id, username: login } = await this.#api.Users.current();
    return { id, login };
  }

  async getRepositories(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    //console.log(await this.#api.Repositories);
    return repositories;
  }

  async getOrgRepositories(org: string): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfOrgWithPaginationQuery>;
    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllReposOfOrgWithPaginationQuery>({
          query: GetAllReposOfOrgWithPagination,
          variables: {
            orgLogin: org,
            cursorRepo: repoEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.organization.repositories
          .pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.organization.repositories.edges.map(
        (r: Record<string, any>) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          repo.organization = org;

          repositories.push(repo);
        },
      );
    } while (
      graphQLResultWithPagination.data.viewer.organization.repositories.pageInfo
        .hasNextPage
    );

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

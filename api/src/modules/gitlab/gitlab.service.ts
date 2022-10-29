import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfOrgWithPagination,
} from 'src/generated/graphql';
import { ApolloQueryResult } from '@apollo/client';
import { Repo } from 'src/entities/repo.entity';
import { Gitlab } from '@gitbeaker/node';

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

  auth(token: string): void {
    this.#token = token;
    this.#api = new Gitlab({
      host: 'https://gitlab.com/api/v4',
      token,
    });
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<{ id: number; login: string }[]> {
    //return await this.#api.Groups.all({ maxPages: 50000 });
    return [{ id: 1, login: 'hi' }];
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    console.log(await this.#api.Users.current());
    const { id, username: login } = await this.#api.Users.current();
    return { id, login };
  }

  async getRepositories(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    console.log(await this.#api.Repositories);
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
    const appOctokit = new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      },
    });

    await appOctokit.rest.apps.deleteAuthorization({
      client_id: process.env.GITHUB_ID,
      access_token: token,
    });
  }
}

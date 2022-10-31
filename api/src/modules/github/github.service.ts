import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllReposOfOrgWithPaginationQuery,
  GetAllReposOfOrgWithPagination,
  GetAllOrgsWithPaginationQuery,
  GetAllOrgsWithPagination,
  GetAllReposOfUserWithPaginationQuery,
  GetAllReposOfUserWithPagination,
} from 'src/generated/graphql';
import { ApolloQueryResult } from '@apollo/client';
import { Repo } from 'src/entities/repo.entity';

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

@Injectable()
export class GithubService {
  apolloService: ApolloService;
  #octokit: Octokit;
  #token: string;

  auth(token: string): void {
    this.#token = token;
    this.#octokit = new Octokit({
      auth: token,
    });
    this.apolloService = new ApolloService(token);
  }

  getToken() {
    return this.#token;
  }

  async getAllOrganizations(): Promise<string[]> {
    const organizations: { id: number; login: string }[] = [];
    let orgEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllOrgsWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllOrgsWithPaginationQuery>({
          query: GetAllOrgsWithPagination,
          variables: {
            cursorOrg: orgEndCursor,
          },
        });

      orgEndCursor =
        graphQLResultWithPagination.data.viewer.organizations.pageInfo
          .endCursor;

      graphQLResultWithPagination.data.viewer.organizations.edges.map(
        (o: Record<string, any>) => {
          organizations.push({
            id: o.node.id,
            login: o.node.login,
          });
        },
      );
    } while (
      graphQLResultWithPagination.data.viewer.organizations.pageInfo.hasNextPage
    );

    return organizations.flatMap((o) => o.login);
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    return (await this.#octokit.rest.users.getAuthenticated()).data;
  }

  async getRepositories(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    let repoEndCursor: string = null;
    let graphQLResultWithPagination: ApolloQueryResult<GetAllReposOfUserWithPaginationQuery>;

    do {
      graphQLResultWithPagination = await this.apolloService
        .githubClient()
        .query<GetAllReposOfUserWithPaginationQuery>({
          query: GetAllReposOfUserWithPagination,
          variables: {
            cursorRepo: repoEndCursor,
          },
        });

      repoEndCursor =
        graphQLResultWithPagination.data.viewer.repositories.pageInfo.endCursor;

      graphQLResultWithPagination.data.viewer.repositories.edges
        .filter((r: Record<string, any>) => !r.node.isInOrganization)
        .map((r: Record<string, any>) => {
          const repo: Repo = new Repo();
          repo.id = r.node.id;
          repo.name = r.node.name;
          repositories.push(repo);
        });
    } while (
      graphQLResultWithPagination.data.viewer.repositories.pageInfo.hasNextPage
    );

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

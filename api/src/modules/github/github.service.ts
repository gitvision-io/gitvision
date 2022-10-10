import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllOrganizations,
  GetAllOrganizationsQuery,
  GetAllRepositoriesOfOrganization,
  GetAllRepositoriesOfOrganizationQuery,
} from 'src/generated/graphql';

@Injectable()
export class GithubService {
  apolloService: ApolloService;
  #octokit: Octokit;

  auth(token: string): void {
    this.#octokit = new Octokit({
      auth: token,
    });
    this.apolloService = new ApolloService(token);
  }

  async getAllOrganizations(): Promise<{ id: number; login: string }[]> {
    const result = await this.apolloService
      .githubClient()
      .query<GetAllOrganizationsQuery>({
        query: GetAllOrganizations,
      });
    return result.data.viewer.organizations.edges.map((organization) => ({
      id: organization.node.databaseId,
      login: organization.node.login,
    }));
  }

  async getProfile(): Promise<{ id: number; login: string }> {
    return (await this.#octokit.rest.users.getAuthenticated()).data;
  }

  async getRepositories(
    type: 'public' | 'private' | 'all',
  ): Promise<{ id: number; name: string }[]> {
    return (
      await this.#octokit.rest.repos.listForAuthenticatedUser({
        type,
      })
    ).data;
  }

  async getOrgRepositories(
    org: string,
    type: 'public' | 'private',
  ): Promise<{ id: number; name: string; branches: { name: string }[] }[]> {
    const result = await this.apolloService
      .githubClient()
      .query<GetAllRepositoriesOfOrganizationQuery>({
        query: GetAllRepositoriesOfOrganization,
        variables: {
          login: org,
        },
      });
    return result.data.viewer.organization.repositories.edges.map(
      (repository) => ({
        id: repository.node.databaseId,
        name: repository.node.name,
        branches: repository.node.refs.nodes,
      }),
    );
  }

  async revokeAccess(token: string): Promise<{ id: number; name: string }[]> {
    const appOctokit = new Octokit({
      authStrategy: createOAuthAppAuth,
      auth: {
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      },
    });
    return (
      await appOctokit.rest.apps.deleteAuthorization({
        client_id: process.env.GITHUB_ID,
        access_token: token,
      })
    ).data;
  }
}

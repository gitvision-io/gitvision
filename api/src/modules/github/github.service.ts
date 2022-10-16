import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { ApolloService } from '../apollo-client/apollo.service';
import {
  GetAllOrganizations,
  GetAllOrganizationsQuery,
  GetAllRepositoriesOfOrganization,
  GetAllRepositoriesOfOrganizationQuery,
  GetAllRepositoriesForUser,
  GetAllRepositoriesForUserQuery,
  GetAllRespositoriesAndOrganization,
  GetAllRespositoriesAndOrganizationQuery,
} from 'src/generated/graphql';

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

  async getOrgIssues(org: string, date: Date): Promise<GithubIssue[]> {
    const res = await this.#octokit.paginate(
      this.#octokit.search.issuesAndPullRequests,
      {
        q: `org:${org} created:>${date.toISOString().split('T')[0]}`,
      },
    );
    return res.map((r) => ({ ...r, org }));
  }

  async getUserIssues(user: string, date: Date): Promise<GithubIssue[]> {
    return await this.#octokit.paginate(
      this.#octokit.search.issuesAndPullRequests,
      {
        q: `user:${user} created:>${date.toISOString().split('T')[0]}`,
      },
    );
  }

  async getRepositories(
    type: 'public' | 'private' | 'all',
  ): Promise<{ id: string; name: string; branches: { name: string }[] }[]> {
    const result = await this.apolloService
      .githubClient()
      .query<GetAllRepositoriesForUserQuery>({
        query: GetAllRepositoriesForUser,
      });
    return result.data.viewer.repositories.edges
      .filter((r) => r.node.isInOrganization === false)
      .map((repository) => ({
        id: repository.node.id,
        name: repository.node.name,
        branches: repository.node.refs.nodes.map((branch) => ({
          name: branch.name,
        })),
      }));
  }

  async getMainAndOrgRespositories(): Promise<
    { id: string; name: string; organization: string }[]
  > {
    const result = await this.apolloService
      .githubClient()
      .query<GetAllRespositoriesAndOrganizationQuery>({
        query: GetAllRespositoriesAndOrganization,
      });
    return [
      ...result.data.viewer.repositories.edges.map((repository) => ({
        id: repository.node.id,
        name: repository.node.name,
        organization: 'user',
      })),

      ...result.data.viewer.organizations.edges.flatMap((o) =>
        o.node.repositories.edges.map((repository) => ({
          id: repository.node.id,
          name: repository.node.name,
          organization: o.node.login,
        })),
      ),
    ];
  }

  async getOrgRepositories(
    org: string,
    type: 'public' | 'private' | 'all',
  ): Promise<{ id: string; name: string; branches: { name: string }[] }[]> {
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
        id: repository.node.id,
        name: repository.node.name,
        branches: repository.node.refs.nodes.map((branch) => ({
          name: branch.name,
        })),
      }),
    );
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

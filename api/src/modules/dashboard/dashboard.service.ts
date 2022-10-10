import { Injectable } from '@nestjs/common';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';
import { Octokit } from '@octokit/rest';
import {
  GetAllOrganizations,
  GetAllOrganizationsQuery,
  GetAllRepositoriesOfOrganization,
  GetAllRepositoriesOfOrganizationQuery,
} from 'src/generated/graphql';
import { ApolloService } from '../apollo-client/apollo.service';

@Injectable()
export class DashboardService {
  apolloService: ApolloService;

  auth(token: string) {
    this.apolloService = new ApolloService(token);
  }

  async getAllOrganizations(): Promise<{ id: string; login: string }[]> {
    const result = await this.apolloService
      .githubClient()
      .query<GetAllOrganizationsQuery>({
        query: GetAllOrganizations,
      });
    return result.data.viewer.organizations.edges.map((organization) => ({
      id: organization.node.id,
      login: organization.node.login,
    }));
  }

  async getAllRepositories(
    org: string,
    type: 'public' | 'private',
  ): Promise<{ id: string; name: string }[]> {
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

import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { createOAuthAppAuth } from '@octokit/auth-oauth-app';

@Injectable()
export class GithubService {
  #octokit: Octokit;

  auth(token: string): void {
    this.#octokit = new Octokit({
      auth: token,
    });
  }

  async getOrgs(): Promise<{ id: number; login: string }[]> {
    return (await this.#octokit.rest.orgs.listForAuthenticatedUser()).data;
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
  ): Promise<{ id: number; name: string }[]> {
    return (
      await this.#octokit.rest.repos.listForOrg({
        org,
        type,
      })
    ).data;
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

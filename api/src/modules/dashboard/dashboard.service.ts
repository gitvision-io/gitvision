import { Injectable } from '@nestjs/common';
import { Octokit } from '@octokit/rest';

@Injectable()
export class DashboardService {
  #octokit: Octokit;

  auth(token: string): void {
    this.#octokit = new Octokit({
      auth: token,
    });
  }

  async getOrgs(): Promise<{ id: number; login: string }[]> {
    return (await this.#octokit.rest.orgs.listForAuthenticatedUser()).data;
  }

  async getRepositories(
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
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';

import { Repository } from 'typeorm';
import { Gitlab } from '@gitbeaker/node';
import { ProjectSchema } from '@gitbeaker/core/dist/types/types';
import { Commit } from 'src/entities/commit.entity';

export interface Organization {
  id: string;
  login: string;
  databaseId: number;
}

const defaultAPI = new Gitlab(null);

@Injectable()
export class RepoGitlabService {
  #api: typeof defaultAPI;

  constructor(
    @InjectRepository(Repo)
    private repoRepository: Repository<Repo>,

    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
  ) {}

  auth(token: string): void {
    this.#api = new Gitlab({
      host: 'https://gitlab.com',
      oauthToken: token,
    });
  }

  async upsert(id: string, repo: Repo): Promise<void> {
    await this.repoRepository.upsert(
      {
        id,
        ...repo,
      },
      ['id'],
    );
  }

  // Get all organisations
  async getAllOrgWithPagination(): Promise<Organization[]> {
    const organizations: Organization[] = [];
    return organizations;
  }

  // Get all repositories
  async getAllRepoOfAllOrgWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];
    const orgs = await this.#api.Groups.all({ maxPages: 50000 });
    await Promise.all([
      ...orgs.map(async (o) => {
        if (o.id) {
          const projects: ProjectSchema[] = await this.#api.Groups.projects(
            o.id,
          );

          if (projects) {
            projects.map((p) => {
              if (p.id != null) {
                const repo: Repo = new Repo();
                repo.id = p.id.toString();
                repo.name = p.name;
                repo.organization = o.full_path;

                repositories.push(repo);
              }
            });
          }
        }
      }),
    ]);
    return repositories;
  }

  async getAllRepoOfUserWithPagination(): Promise<Repo[]> {
    const repositories: Repo[] = [];

    return repositories;
  }

  // Get all commits
  async getCommitsOfAllRepoOfAllOrgWithPagination(date: Date): Promise<void> {
    const allRepos = await this.getAllRepoOfAllOrgWithPagination();
    await Promise.all([
      ...allRepos.map(async (r) => {
        if (r.id != null) {
          const commitsGitlab = await this.#api.Commits.all(r.id, {
            maxPages: 5,
            since: date,
          });
          const shaCommits = commitsGitlab.flatMap((c) => c.id);
          const commits = await Promise.all([
            ...shaCommits.map(async (i) => {
              if (i != null) {
                const commit = new Commit();
                const commitsStatsGitlab = await this.#api.Commits.show(
                  r.id,
                  i.toString(),
                );
                commit.id = i;

                commit.repoId = r.id.toString();
                commit.date = commitsStatsGitlab.committed_date;
                commit.author = commitsStatsGitlab.author_name;
                commit.numberOfLineAdded = commitsStatsGitlab.stats.additions;
                commit.numberOfLineRemoved = commitsStatsGitlab.stats.deletions;
                commit.numberOfLineModified =
                  commitsStatsGitlab.stats.additions -
                  commitsStatsGitlab.stats.deletions;
                return commit;
              }
            }),
          ]);
          this.commitRepository.save(commits);
          r.commits = commits;
        }

        this.upsert(r.id, r);
        return r;
      }),
    ]);
  }

  async getCommitsOfAllRepoOfUserWithPagination(date: Date): Promise<void> {
    return null;
  }

  // Get all issues
  async getIssuesOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    return null;
  }

  async getIssuesOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }

  // Get all pull requests
  async getPullRequestsOfAllRepoOfAllOrgWithPagination(): Promise<void> {
    return null;
  }

  async getPullRequestsOfAllRepoOfUserWithPagination(): Promise<void> {
    return null;
  }
}

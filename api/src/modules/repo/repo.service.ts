import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Commit } from 'src/entities/commit.entity';
import { Issue } from 'src/entities/issue.entity';
import { PullRequest } from 'src/entities/pullrequest.entity';
import { Repo } from 'src/entities/repo.entity';
import { Repository } from 'typeorm';
import { GitProviderService } from '../git-provider/gitprovider.service';

@Injectable()
export class RepoService {
  constructor(
    private readonly gitProviderService: GitProviderService,
    @InjectRepository(Commit)
    private commitRepository: Repository<Commit>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(PullRequest)
    private pullRequestRepository: Repository<PullRequest>,
  ) {}

  // Get all commits
  async getCommitsOfRepos(repos: Repo[], date: Date): Promise<void> {
    const commits = await this.gitProviderService.getCommitsOfRepos(
      repos,
      date,
    );
    await this.commitRepository.save(commits, { chunk: 100 });
  }

  // Get all issues
  async getIssuesOfRepos(repos: Repo[], date: Date): Promise<void> {
    const issues = await this.gitProviderService.getIssuesOfRepos(repos, date);
    this.issueRepository.save(issues, { chunk: 100 });
  }

  // Get all pull requests
  async getPullRequestsOfRepos(repos: Repo[], date: Date): Promise<void> {
    const pullRequests = await this.gitProviderService.getPullRequestsOfRepos(
      repos,
      date,
    );
    this.pullRequestRepository.save(pullRequests, {
      chunk: 100,
    });
  }
}

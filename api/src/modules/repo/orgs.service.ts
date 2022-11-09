import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repo } from 'src/entities/repo.entity';
import { Equal, In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class OrgsService {
  protected isPublic: boolean;

  constructor(
    @InjectRepository(Repo)
    protected repoRepository: Repository<Repo>,
  ) {}

  async getAllOrganizations(userId?: string): Promise<string[]> {
    let qb = this.repoRepository.createQueryBuilder('repo');
    if (!this.isPublic) {
      qb = qb.innerJoin('repo.users', 'repoUsers', 'repoUsers.id = (:userId)', {
        userId,
      });
    }

    return (
      await qb
        .where({ organization: Not(IsNull()) })
        .select('organization')
        .distinct()
        .getRawMany()
    ).map((r: { organization: string }) => r.organization);
  }

  async getRepositories(
    organization: string | null,
    userId?: string,
  ): Promise<string[]> {
    let qb = this.repoRepository.createQueryBuilder('repo');
    if (!this.isPublic) {
      qb = qb.innerJoin('repo.users', 'repoUsers', 'repoUsers.id = (:userId)', {
        userId,
      });
    }
    return (
      await qb
        .select('repo.name')
        .where({
          organization: organization === null ? IsNull() : Equal(organization),
        })
        .distinct()
        .getRawMany()
    ).map((r) => r.repo_name);
  }

  async findByOrgByReposAndTime(
    organization: string | null,
    names: string[],
    time: string,
    userId?: string,
  ): Promise<Repo[]> {
    const date = new Date();
    switch (time) {
      case 'last day':
        date.setHours(date.getHours() - 24);
        break;

      case 'last week':
        date.setHours(date.getHours() - 168);
        break;

      case 'last month':
        date.setMonth(date.getMonth() - 1);
        break;

      case 'last 3 months':
        date.setMonth(date.getMonth() - 3);
        break;

      case 'last 6 months':
        date.setMonth(date.getMonth() - 6);
        break;
    }
    let qb = this.repoRepository.createQueryBuilder('repo');
    if (!this.isPublic) {
      qb = qb.innerJoin('repo.users', 'repoUsers', 'repoUsers.id = (:userId)', {
        userId,
      });
    }

    return await qb
      .innerJoinAndSelect('repo.commits', 'commits', 'commits.date >= :date', {
        date,
      })
      .leftJoinAndSelect('repo.issues', 'issues', 'issues.createdAt >= :date', {
        date,
      })
      .leftJoinAndSelect(
        'repo.pullRequests',
        'pullRequests',
        'pullRequests.createdAt >= :date',
        {
          date,
        },
      )
      .where({
        name: In(Object.values(names || {})),
        organization: organization === null ? IsNull() : organization,
      })
      .getMany();
  }
}

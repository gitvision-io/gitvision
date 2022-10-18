import { Entity, Column, OneToMany, PrimaryColumn, ManyToMany } from 'typeorm';
import { Issue } from './issue.entity';
import { User } from './user.entity';
import { Commit } from './commit.entity';
import { PullRequest } from './pullrequest.entity';

@Entity()
export class Repo {
  @PrimaryColumn()
  id: string;

  @Column({
    type: String,
    nullable: true,
  })
  repoName: string;

  @Column({
    type: String,
    nullable: true,
  })
  organization?: string;

  @OneToMany(() => Commit, (commit) => commit.repo)
  commits: Commit[];

  @OneToMany(() => Issue, (issue: Issue) => issue.repo)
  issues: Issue[];

  @OneToMany(() => PullRequest, (pullRequest: PullRequest) => pullRequest.repo)
  pullRequests: PullRequest[];

  @ManyToMany(() => User, (user: User) => user.repos)
  users: User[];
}

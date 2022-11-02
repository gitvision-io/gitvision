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
  name: string;

  @Column({
    type: String,
    nullable: true,
  })
  organization?: string;

  @OneToMany(() => Commit, (commit) => commit.repo, {
    cascade: ['insert', 'update'],
  })
  commits: Commit[];

  @OneToMany(() => Issue, (issue: Issue) => issue.repo, {
    cascade: ['insert', 'update'],
  })
  issues: Issue[];

  @OneToMany(
    () => PullRequest,
    (pullRequest: PullRequest) => pullRequest.repo,
    {
      cascade: ['insert', 'update'],
    },
  )
  pullRequests: PullRequest[];

  @ManyToMany(() => User, (user: User) => user.repos)
  users: User[];
}

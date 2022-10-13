import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Issue } from './issue.entity';
import { UserRepoStats } from './userRepoStats.entity';

@Entity()
export class RepoStats {
  @PrimaryColumn()
  id: string;

  @Column({
    type: String,
    nullable: true,
  })
  repoName: string;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfCommits: number;

  @Column({
    type: String,
    nullable: true,
  })
  organization: string;

  @OneToMany(() => UserRepoStats, (userRepoStats) => userRepoStats.repoStats)
  usersRepoStats: UserRepoStats[];

  @OneToMany(() => Issue, (issue: Issue) => issue.repoStats)
  usersIssueDates: Issue[];
}

import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { UserRepoStats } from './userRepoStats.entity';

@Entity()
export class RepoStats {
  @PrimaryColumn()
  repoId: string;

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
}

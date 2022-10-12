import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRepoStats } from './userRepoStats.entity';

@Entity()
export class RepoStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: String,
  })
  repoId: string;

  @Column({
    type: String,
    nullable: true,
  })
  repoName: string;

  @Column({
    type: String,
    nullable: true,
  })
  organization: string;

  @OneToMany(() => UserRepoStats, (userRepoStats) => userRepoStats.repoStats)
  usersRepoStats: UserRepoStats[];
}

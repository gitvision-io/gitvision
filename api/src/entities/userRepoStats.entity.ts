import { Column, Entity, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { RepoStats } from './repoStats.entity';

@Entity()
export class UserRepoStats {
  @PrimaryColumn()
  commitId: string;

  @Column({
    type: String,
  })
  repoId: string;

  @Column({
    type: String,
    nullable: true,
  })
  author: string;

  @Column({
    type: Date,
  })
  date: Date;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineAdded: number;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineRemoved: number;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineModified: number;

  @OneToOne(() => RepoStats, (repoStats) => repoStats.usersRepoStats)
  repoStats: RepoStats;
}

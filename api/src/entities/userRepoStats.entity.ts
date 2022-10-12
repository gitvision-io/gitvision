import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { RepoStats } from './repoStats.entity';

@Entity()
export class UserRepoStats {
  @PrimaryColumn()
  repoId: string;

  @Column({
    type: String,
    nullable: true,
  })
  author: string;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfCommit: number | 0;

  @Column({
    type: Date,
  })
  date: Date;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineAdded: number | 0;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineRemoved: number | 0;

  @Column({
    type: Number,
    nullable: true,
  })
  numberOfLineModified: number | 0;

  @OneToOne(() => RepoStats, (repoStats) => repoStats.usersRepoStats)
  repoStats: RepoStats;
}

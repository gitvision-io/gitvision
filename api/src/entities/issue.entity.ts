import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { RepoStats } from './repoStats.entity';

@Entity()
export class Issue {
  @PrimaryColumn({ type: 'datetime' })
  createdAt: string;

  @Column({ type: String })
  repoId: string;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  closedAt: string;

  @Column({
    type: String,
    nullable: true,
  })
  closedBy: string;

  @Column({
    type: String,
  })
  state: string;

  @ManyToOne(() => RepoStats, (repoStats) => repoStats.usersIssueDates)
  repoStats: RepoStats;
}

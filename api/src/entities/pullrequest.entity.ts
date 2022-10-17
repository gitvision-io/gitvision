import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class PullRequest {
  @PrimaryColumn({ type: String })
  id: string;

  @Column({ type: String })
  repoId: string;

  @Column({ type: 'datetime', nullable: true })
  createdAt: string;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  closedAt: string;

  @Column({
    type: String,
  })
  state: string;

  @ManyToOne(() => Repo, (repo) => repo.pullRequests)
  repo: Repo;
}

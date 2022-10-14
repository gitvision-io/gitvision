import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class Issue {
  @PrimaryColumn({ type: String })
  id: string;

  @Column({ type: 'datetime' })
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

  @ManyToOne(() => Repo, (repo) => repo.issues)
  repo: Repo;
}
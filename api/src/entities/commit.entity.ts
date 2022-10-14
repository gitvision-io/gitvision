import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class Commit {
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

  @ManyToOne(() => Repo, (repo) => repo.commits)
  repo: Repo;
}

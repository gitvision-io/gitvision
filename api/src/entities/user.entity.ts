import { Entity, Column, PrimaryColumn, ManyToMany, JoinTable } from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({
    type: String,
    nullable: true,
  })
  email: string;

  @Column({
    type: String,
    nullable: true,
  })
  name: string;

  @Column({
    type: String,
    nullable: true,
  })
  avatarUrl: string;

  @Column({
    type: Date,
    nullable: true,
  })
  lastSynchronize: Date;

  @Column({
    type: String,
    nullable: true,
  })
  gitProviderId: string | null;

  @Column({
    type: String,
    nullable: true,
  })
  gitProviderToken: string | null;

  @Column({
    type: String,
    nullable: true,
  })
  gitProviderName: string | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Repo, (repo) => repo.users)
  @JoinTable()
  repos: Repo[];
}

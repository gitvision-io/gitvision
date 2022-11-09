import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  JoinTable,
  BaseEntity,
} from 'typeorm';
import { Repo } from './repo.entity';

@Entity()
export class User extends BaseEntity {
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

  @ManyToMany(() => Repo, (repo) => repo.users, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  repos: Repo[];
}

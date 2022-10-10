import { Entity, Column, PrimaryColumn } from 'typeorm';

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
    type: String,
    nullable: true,
  })
  githubId: string | null;

  @Column({
    type: String,
    nullable: true,
  })
  githubToken: string | null;

  @Column({ default: true })
  isActive: boolean;
}
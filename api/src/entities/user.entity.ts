import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
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

import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  githubId: string;

  @Column()
  githubToken: string;

  @Column({ default: true })
  isActive: boolean;
}

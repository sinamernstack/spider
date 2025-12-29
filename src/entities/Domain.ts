import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'domains' })
export class Domain {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  @Index()
  host!: string;

  @Column({ type: 'text', nullable: true })
  canonical_url?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

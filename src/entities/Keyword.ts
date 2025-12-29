import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity({ name: 'keywords' })
export class Keyword {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  project_id!: string;

  @Column({ type: 'text' })
  keyword!: string;

  @Column({ type: 'text' })
  @Index()
  normalized_keyword!: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  @Column({ type: 'integer', nullable: true })
  search_volume?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

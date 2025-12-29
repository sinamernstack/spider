import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'rank_results' })
export class RankResult {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'uuid' })
  rank_check_id!: string;

  @Column({ type: 'uuid' })
  project_id!: string;

  @Column({ type: 'uuid' })
  keyword_id!: string;

  @Column({ type: 'uuid', nullable: true })
  competitor_id?: string;

  @Column({ type: 'uuid', nullable: true })
  domain_id?: string;

  @Column({ type: 'smallint' })
  search_engine_id!: number;

  @Column({ type: 'char', length: 2, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  @Column({ type: 'integer', nullable: true })
  position?: number;

  @Column({ type: 'text', nullable: true })
  result_url?: string;

  @Column({ type: 'text', nullable: true })
  result_title?: string;

  @Column({ type: 'text', nullable: true })
  result_snippet?: string;

  @Column({ type: 'boolean', default: false })
  is_featured_snippet!: boolean;

  @Column({ type: 'boolean', default: false })
  is_ad!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  raw_rank_data?: any;

  @Column({ type: 'timestamptz' })
  checked_at!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

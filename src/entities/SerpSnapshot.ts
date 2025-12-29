import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'serp_snapshots' })
export class SerpSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  rank_check_id!: string;

  @Column({ type: 'uuid' })
  keyword_id!: string;

  @Column({ type: 'smallint', nullable: true })
  search_engine_id?: number;

  @Column({ type: 'char', length: 2, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  language?: string;

  @Column({ type: 'jsonb' })
  snapshot_json!: any;

  @Column({ type: 'text', nullable: true })
  snapshot_hash?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'rank_checks' })
export class RankCheck {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  project_id!: string;

  @Column({ type: 'timestamptz' })
  scheduled_at!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  started_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  finished_at?: Date;

  @Column({ type: 'text', nullable: true })
  initiated_by?: string;

  @Column({ type: 'smallint', default: 0 })
  status!: number;

  @Column({ type: 'jsonb', nullable: true })
  settings_snapshot?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

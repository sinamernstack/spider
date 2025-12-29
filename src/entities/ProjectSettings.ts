import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'project_settings' })
export class ProjectSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  project_id!: string;

  @Column({ type: 'char', length: 2, nullable: true })
  default_country?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  default_language?: string;

  @Column({ type: 'text', nullable: true })
  check_cron?: string;

  @Column({ type: 'time', nullable: true })
  check_window_start?: string;

  @Column({ type: 'time', nullable: true })
  check_window_end?: string;

  @Column({ type: 'integer', nullable: true })
  check_frequency_minutes?: number;

  @Column({ type: 'jsonb', nullable: true })
  settings?: any;
}

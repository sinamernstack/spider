import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'audit_events' })
export class AuditEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  project_id?: string;

  @Column({ type: 'text', nullable: true })
  actor?: string;

  @Column({ type: 'text' })
  event_type!: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

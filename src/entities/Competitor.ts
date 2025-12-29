import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'competitors' })
export class Competitor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  project_id!: string;

  @Column({ type: 'uuid' })
  domain_id!: string;

  @Column({ type: 'text', nullable: true })
  label?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;
}

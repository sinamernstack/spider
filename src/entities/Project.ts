import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Domain } from './Domain';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @ManyToOne(() => Domain, { nullable: false })
  @JoinColumn({ name: 'domain_id' })
  domain!: Domain;

  @Column({ type: 'uuid', nullable: true })
  owner_id?: string;

  @Column({ type: 'smallint', default: 1 })
  status!: number;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}

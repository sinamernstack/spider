import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'keyword_targets' })
export class KeywordTarget {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  keyword_id!: string;

  @Column({ type: 'uuid', nullable: true })
  competitor_id?: string;

  @Column({ type: 'text', nullable: true })
  target_url?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;
}

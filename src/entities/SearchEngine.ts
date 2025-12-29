import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'search_engines' })
export class SearchEngine {
  @PrimaryColumn({ type: 'smallint' })
  id!: number;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'boolean', default: false })
  is_mobile!: boolean;

  @Column({ type: 'text', nullable: true })
  engine_region?: string;
}

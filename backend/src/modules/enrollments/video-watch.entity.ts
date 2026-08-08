import { Column, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'video_watch' })
@Index(['enrollmentId', 'moduleId'], { unique: true })
export class VideoWatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'enrollment_id' })
  enrollmentId!: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId!: string;

  @Column({ type: 'int', name: 'position_sec', default: 0 })
  positionSec!: number;

  @Column({ type: 'int', name: 'max_position_sec', default: 0 })
  maxPositionSec!: number;

  @Column({ type: 'int', name: 'duration_sec', nullable: true })
  durationSec!: number | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

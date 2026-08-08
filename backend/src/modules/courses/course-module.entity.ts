import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ModuleContentType = 'text' | 'video' | 'url' | 'file';

@Entity({ name: 'course_modules' })
export class CourseModule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Column({ type: 'int' })
  position!: number;

  @Column({ type: 'text', name: 'title_es' })
  titleEs!: string;

  @Column({ type: 'text', name: 'title_en', nullable: true })
  titleEn!: string | null;

  @Column({ type: 'text', name: 'content_type', default: 'text' })
  contentType!: ModuleContentType;

  @Column({ type: 'text', name: 'content_url', nullable: true })
  contentUrl!: string | null;

  @Column({ type: 'text', name: 'content_body', nullable: true })
  contentBody!: string | null;

  @Column({ type: 'int', name: 'duration_min', nullable: true })
  durationMin!: number | null;
}

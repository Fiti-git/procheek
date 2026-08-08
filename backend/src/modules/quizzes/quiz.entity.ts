import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export interface QuizQuestion {
  id: string;            // client-safe id (uuid-ish)
  prompt: string;
  choices: string[];
  correctIndex: number;  // stripped before sending to learners
}

@Entity({ name: 'quizzes' })
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'course_id' })
  courseId!: string;

  @Column({ type: 'text', name: 'title_es' })
  titleEs!: string;

  @Column({ type: 'text', name: 'title_en', nullable: true })
  titleEn!: string | null;

  @Column({ type: 'int', name: 'passing_score', default: 80 })
  passingScore!: number;

  @Column({ type: 'int', name: 'max_attempts', default: 3 })
  maxAttempts!: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  questions!: QuizQuestion[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

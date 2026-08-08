import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Quiz, QuizQuestion } from './quiz.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { UpsertQuizDto } from './dto/upsert-quiz.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { Course } from '../courses/course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CertificatesService } from '../certificates/certificates.service';
import { Role } from '../../common/roles';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

// Learner view of a quiz — never leaks `correctIndex`.
export interface QuizForLearner {
  id: string;
  courseId: string;
  titleEs: string;
  titleEn: string | null;
  passingScore: number;
  maxAttempts: number;
  attemptsUsed: number;
  bestScore: number | null;
  passed: boolean;
  questions: Array<{ id: string; prompt: string; choices: string[] }>;
}

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz) private readonly quizzes: Repository<Quiz>,
    @InjectRepository(QuizAttempt) private readonly attempts: Repository<QuizAttempt>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    private readonly certificates: CertificatesService,
  ) {}

  async upsert(dto: UpsertQuizDto): Promise<Quiz> {
    const course = await this.courses.findOne({ where: { id: dto.courseId } });
    if (!course) throw new BadRequestException('courseId not found');

    // Assign IDs to any new questions, validate correctIndex bounds.
    const questions: QuizQuestion[] = dto.questions.map((q) => {
      if (q.correctIndex >= q.choices.length) {
        throw new BadRequestException(`correctIndex out of range for question "${q.prompt.slice(0, 40)}..."`);
      }
      return {
        id: q.id || randomUUID(),
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
      };
    });

    const existing = await this.quizzes.findOne({ where: { courseId: dto.courseId } });
    if (existing) {
      Object.assign(existing, {
        titleEs: dto.titleEs,
        titleEn: dto.titleEn ?? null,
        passingScore: dto.passingScore,
        maxAttempts: dto.maxAttempts,
        questions,
      });
      return this.quizzes.save(existing);
    }
    return this.quizzes.save(this.quizzes.create({
      courseId: dto.courseId,
      titleEs: dto.titleEs,
      titleEn: dto.titleEn ?? null,
      passingScore: dto.passingScore,
      maxAttempts: dto.maxAttempts,
      questions,
    }));
  }

  async findByCourseAdmin(courseId: string): Promise<Quiz | null> {
    return this.quizzes.findOne({ where: { courseId } });
  }

  async findByCourseForLearner(courseId: string, actor: RequestUser): Promise<QuizForLearner> {
    const quiz = await this.quizzes.findOne({ where: { courseId } });
    if (!quiz) throw new NotFoundException('No quiz for this course');
    const priorAttempts = await this.attempts.find({
      where: { quizId: quiz.id, userId: actor.userId },
      order: { startedAt: 'DESC' },
    });
    const best = priorAttempts.reduce<number | null>((max, a) => a.score > (max ?? -1) ? a.score : max, null);
    const passed = priorAttempts.some((a) => a.passed);
    return {
      id: quiz.id,
      courseId: quiz.courseId,
      titleEs: quiz.titleEs,
      titleEn: quiz.titleEn,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      attemptsUsed: priorAttempts.length,
      bestScore: best,
      passed,
      questions: quiz.questions.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices })),
    };
  }

  async submitAttempt(quizId: string, dto: SubmitAttemptDto, actor: RequestUser) {
    const quiz = await this.quizzes.findOne({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const enrollment = await this.enrollments.findOne({
      where: { userId: actor.userId, courseId: quiz.courseId },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    const priorCount = await this.attempts.count({ where: { quizId, userId: actor.userId } });
    if (priorCount >= quiz.maxAttempts) {
      throw new BadRequestException(`Max attempts (${quiz.maxAttempts}) reached`);
    }

    const answerMap = new Map(dto.answers.map((a) => [a.questionId, a.choiceIndex]));
    let correct = 0;
    for (const q of quiz.questions) {
      if (answerMap.get(q.id) === q.correctIndex) correct++;
    }
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await this.attempts.save(this.attempts.create({
      quizId,
      userId: actor.userId,
      score,
      passed,
      answers: dto.answers.map((a) => ({ questionId: a.questionId, choiceIndex: a.choiceIndex })),
      submittedAt: new Date(),
    }));

    // On pass — mark enrollment complete and issue certificate.
    let certificate: { id: string; code: string } | null = null;
    if (passed && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.progressPct = 100;
      enrollment.completedAt = new Date();
      await this.enrollments.save(enrollment);
      try {
        const cert = await this.certificates.issueForEnrollment(enrollment.id);
        certificate = { id: cert.id, code: cert.code };
      } catch {}
    }

    return {
      attemptId: attempt.id,
      score,
      passed,
      passingScore: quiz.passingScore,
      correctCount: correct,
      totalQuestions: quiz.questions.length,
      attemptsRemaining: Math.max(0, quiz.maxAttempts - priorCount - 1),
      certificate,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Role } from '../../common/roles';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

export interface OverviewStats {
  users: number;
  courses: number;
  enrollments: number;
  completions: number;
  certificates: number;
  revenueMxn: number;
  passRate: number | null;   // % of quiz attempts that passed
  avgWatchPct: number | null;
}

export interface CourseStats {
  courseId: string;
  slug: string;
  title: string;
  nomReference: string | null;
  enrollments: number;
  completions: number;
  completionRate: number;
  avgQuizScore: number | null;
  avgWatchPct: number | null;
}

export interface LearnerStats {
  userId: string;
  email: string;
  fullName: string;
  companyId: string | null;
  enrollments: number;
  completions: number;
  certificates: number;
  totalWatchSec: number;
  lastActivityAt: string | null;
}

@Injectable()
export class AnalyticsService {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  private async scopeUserIds(actor: RequestUser): Promise<string[] | null> {
    if (actor.role === Role.PRINCIPAL_ADMIN) return null; // no scope — everyone
    // Client / Client Admin: own company + subcontractor companies.
    const rows = await this.ds.query(
      `SELECT u.id
       FROM users u
       WHERE u.company_id IN (
         SELECT id FROM companies WHERE id = (SELECT company_id FROM users WHERE id = $1)
         UNION
         SELECT id FROM companies WHERE parent_company_id = (SELECT company_id FROM users WHERE id = $1)
       )`,
      [actor.userId],
    );
    return rows.map((r: any) => r.id);
  }

  async overview(actor: RequestUser): Promise<OverviewStats> {
    const userIds = await this.scopeUserIds(actor);
    const userScope = userIds ? `WHERE user_id = ANY($1::uuid[])` : '';
    const params = userIds ? [userIds] : [];

    const [{ users }] = userIds
      ? await this.ds.query(`SELECT COUNT(*)::int AS users FROM users WHERE id = ANY($1::uuid[])`, [userIds])
      : await this.ds.query(`SELECT COUNT(*)::int AS users FROM users`);

    const [{ courses }] = await this.ds.query(`SELECT COUNT(*)::int AS courses FROM courses WHERE deleted_at IS NULL`);

    const [{ enrollments }] = await this.ds.query(
      `SELECT COUNT(*)::int AS enrollments FROM enrollments ${userScope}`,
      params,
    );
    const [{ completions }] = await this.ds.query(
      `SELECT COUNT(*)::int AS completions FROM enrollments ${userScope}${userScope ? ' AND ' : 'WHERE '}status = 'completed'`,
      params,
    );
    const [{ certificates }] = await this.ds.query(
      `SELECT COUNT(*)::int AS certificates FROM certificates ${userScope}`,
      params,
    );
    const [{ revenue }] = await this.ds.query(
      `SELECT COALESCE(SUM(amount_mxn), 0)::float AS revenue
         FROM payments
         WHERE status = 'paid' ${userScope ? 'AND user_id = ANY($1::uuid[])' : ''}`,
      params,
    );

    // Pass rate — % of attempts that passed.
    const attemptScope = userIds
      ? `WHERE user_id = ANY($1::uuid[])`
      : '';
    const [pr] = await this.ds.query(
      `SELECT
         COUNT(*)::int AS total,
         SUM(CASE WHEN passed THEN 1 ELSE 0 END)::int AS passed
       FROM quiz_attempts ${attemptScope}`,
      params,
    );
    const passRate = pr.total > 0 ? Math.round((pr.passed / pr.total) * 100) : null;

    // Avg watched % of videos.
    const [aw] = await this.ds.query(
      `SELECT AVG(
         CASE WHEN duration_sec > 0
              THEN LEAST(100, ROUND(max_position_sec::numeric / duration_sec::numeric * 100))
              ELSE NULL END
       )::float AS avg_pct
       FROM video_watch
       ${userIds ? 'WHERE enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ANY($1::uuid[]))' : ''}`,
      params,
    );
    const avgWatchPct = aw.avg_pct != null ? Math.round(aw.avg_pct) : null;

    return {
      users,
      courses,
      enrollments,
      completions,
      certificates,
      revenueMxn: revenue,
      passRate,
      avgWatchPct,
    };
  }

  async courses(actor: RequestUser): Promise<CourseStats[]> {
    const userIds = await this.scopeUserIds(actor);
    const scopedEnrJoin = userIds ? `AND e.user_id = ANY($1::uuid[])` : '';
    const params = userIds ? [userIds] : [];

    const rows = await this.ds.query(
      `SELECT
         c.id AS course_id,
         c.slug,
         c.title_es AS title,
         c.nom_reference,
         COALESCE(SUM(CASE WHEN e.id IS NOT NULL THEN 1 ELSE 0 END), 0)::int AS enrollments,
         COALESCE(SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END), 0)::int AS completions,
         (
           SELECT AVG(qa.score)::float
             FROM quiz_attempts qa
             JOIN quizzes q ON q.id = qa.quiz_id
            WHERE q.course_id = c.id ${userIds ? 'AND qa.user_id = ANY($1::uuid[])' : ''}
         ) AS avg_quiz_score,
         (
           SELECT AVG(
             CASE WHEN vw.duration_sec > 0
                  THEN LEAST(100, ROUND(vw.max_position_sec::numeric / vw.duration_sec::numeric * 100))
                  ELSE NULL END
           )::float
             FROM video_watch vw
             JOIN course_modules cm ON cm.id = vw.module_id
            WHERE cm.course_id = c.id
              ${userIds ? 'AND vw.enrollment_id IN (SELECT id FROM enrollments WHERE user_id = ANY($1::uuid[]))' : ''}
         ) AS avg_watch_pct
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id ${scopedEnrJoin}
       WHERE c.deleted_at IS NULL
       GROUP BY c.id
       ORDER BY enrollments DESC, c.created_at DESC`,
      params,
    );

    return rows.map((r: any) => ({
      courseId: r.course_id,
      slug: r.slug,
      title: r.title,
      nomReference: r.nom_reference,
      enrollments: r.enrollments,
      completions: r.completions,
      completionRate: r.enrollments > 0 ? Math.round((r.completions / r.enrollments) * 100) : 0,
      avgQuizScore: r.avg_quiz_score != null ? Math.round(r.avg_quiz_score) : null,
      avgWatchPct: r.avg_watch_pct != null ? Math.round(r.avg_watch_pct) : null,
    }));
  }

  async learners(actor: RequestUser): Promise<LearnerStats[]> {
    const userIds = await this.scopeUserIds(actor);
    const scope = userIds ? `WHERE u.id = ANY($1::uuid[])` : '';
    const params = userIds ? [userIds] : [];

    const rows = await this.ds.query(
      `SELECT
         u.id AS user_id,
         u.email,
         u.first_name || ' ' || u.last_name AS full_name,
         u.company_id,
         (SELECT COUNT(*)::int FROM enrollments WHERE user_id = u.id) AS enrollments,
         (SELECT COUNT(*)::int FROM enrollments WHERE user_id = u.id AND status = 'completed') AS completions,
         (SELECT COUNT(*)::int FROM certificates WHERE user_id = u.id) AS certificates,
         COALESCE((
           SELECT SUM(vw.max_position_sec)::int
             FROM video_watch vw
             JOIN enrollments e ON e.id = vw.enrollment_id
            WHERE e.user_id = u.id
         ), 0) AS total_watch_sec,
         GREATEST(
           u.last_login_at,
           (SELECT MAX(enrolled_at) FROM enrollments WHERE user_id = u.id),
           (SELECT MAX(updated_at) FROM video_watch vw
             JOIN enrollments e ON e.id = vw.enrollment_id
             WHERE e.user_id = u.id)
         ) AS last_activity_at
       FROM users u
       ${scope}
       ORDER BY last_activity_at DESC NULLS LAST
       LIMIT 200`,
      params,
    );

    return rows.map((r: any) => ({
      userId: r.user_id,
      email: r.email,
      fullName: r.full_name,
      companyId: r.company_id,
      enrollments: r.enrollments,
      completions: r.completions,
      certificates: r.certificates,
      totalWatchSec: r.total_watch_sec ?? 0,
      lastActivityAt: r.last_activity_at,
    }));
  }
}

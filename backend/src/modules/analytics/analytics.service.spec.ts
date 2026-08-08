import { AnalyticsService } from './analytics.service';
import { Role } from '../../common/roles';

function makeDs(rows: any[][]) {
  let call = 0;
  return { query: jest.fn().mockImplementation(() => Promise.resolve(rows[call++] ?? [])) } as any;
}

const admin = { userId: 'admin', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const client = { userId: 'c', email: 'c@x.com', role: Role.CLIENT };

describe('AnalyticsService.overview', () => {
  it('admin overview aggregates all metrics', async () => {
    const ds = makeDs([
      [{ users: 42 }],
      [{ courses: 7 }],
      [{ enrollments: 100 }],
      [{ completions: 60 }],
      [{ certificates: 55 }],
      [{ revenue: 12345.67 }],
      [{ total: 20, passed: 15 }],
      [{ avg_pct: 78.4 }],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.overview(admin);
    expect(res.users).toBe(42);
    expect(res.enrollments).toBe(100);
    expect(res.completions).toBe(60);
    expect(res.certificates).toBe(55);
    expect(res.revenueMxn).toBe(12345.67);
    expect(res.passRate).toBe(75);
    expect(res.avgWatchPct).toBe(78);
  });

  it('overview passRate null when no attempts', async () => {
    const ds = makeDs([
      [{ users: 1 }],
      [{ courses: 1 }],
      [{ enrollments: 0 }],
      [{ completions: 0 }],
      [{ certificates: 0 }],
      [{ revenue: 0 }],
      [{ total: 0, passed: 0 }],
      [{ avg_pct: null }],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.overview(admin);
    expect(res.passRate).toBeNull();
    expect(res.avgWatchPct).toBeNull();
  });

  it('client overview first fetches scoped user ids', async () => {
    const ds = makeDs([
      [{ id: 'u-1' }, { id: 'u-2' }], // scope
      [{ users: 2 }],
      [{ courses: 5 }],
      [{ enrollments: 3 }],
      [{ completions: 1 }],
      [{ certificates: 1 }],
      [{ revenue: 100 }],
      [{ total: 4, passed: 2 }],
      [{ avg_pct: 50 }],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.overview(client);
    expect(res.users).toBe(2);
    expect(res.passRate).toBe(50);
  });
});

describe('AnalyticsService.courses', () => {
  it('returns per-course rows with completion rate', async () => {
    const ds = makeDs([
      [
        {
          course_id: 'c-1',
          slug: 'nom35',
          title: 'NOM-035',
          nom_reference: 'NOM-035',
          enrollments: 10,
          completions: 5,
          avg_quiz_score: 82.5,
          avg_watch_pct: 65.3,
        },
      ],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.courses(admin);
    expect(res).toHaveLength(1);
    expect(res[0].completionRate).toBe(50);
    expect(res[0].avgQuizScore).toBe(83);
    expect(res[0].avgWatchPct).toBe(65);
  });

  it('handles zero enrollments (0% completion, null averages)', async () => {
    const ds = makeDs([
      [
        {
          course_id: 'c-1',
          slug: 's',
          title: 't',
          nom_reference: null,
          enrollments: 0,
          completions: 0,
          avg_quiz_score: null,
          avg_watch_pct: null,
        },
      ],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.courses(admin);
    expect(res[0].completionRate).toBe(0);
    expect(res[0].avgQuizScore).toBeNull();
    expect(res[0].avgWatchPct).toBeNull();
  });
});

describe('AnalyticsService.learners', () => {
  it('returns learner rows with sanitized fields', async () => {
    const ds = makeDs([
      [
        {
          user_id: 'u-1',
          email: 'e@x.com',
          full_name: 'H X',
          company_id: 'co-1',
          enrollments: 3,
          completions: 2,
          certificates: 1,
          total_watch_sec: 3600,
          last_activity_at: '2024-01-01',
        },
      ],
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.learners(admin);
    expect(res).toHaveLength(1);
    expect(res[0].userId).toBe('u-1');
    expect(res[0].totalWatchSec).toBe(3600);
  });

  it('scoped call for client fetches ids first', async () => {
    const ds = makeDs([
      [{ id: 'u-1' }], // scope
      [], // learners
    ]);
    const svc = new AnalyticsService(ds);
    const res = await svc.learners(client);
    expect(res).toEqual([]);
  });
});

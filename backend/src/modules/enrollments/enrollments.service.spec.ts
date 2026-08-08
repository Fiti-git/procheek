import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: 'enr-new', ...v })),
    create: jest.fn().mockImplementation((v: any) => v),
    delete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  } as any;
}

function make() {
  const repos = {
    enroll: repo(),
    users: repo(),
    courses: repo(),
    modules: repo(),
    completions: repo(),
    watches: repo(),
  };
  const certificates = { issueForEnrollment: jest.fn().mockResolvedValue({}) } as any;
  const svc = new EnrollmentsService(
    repos.enroll, repos.users, repos.courses, repos.modules,
    repos.completions, repos.watches, certificates,
  );
  return { svc, ...repos, certificates };
}

const actor = { userId: 'u-1', email: 'u@x.com', role: Role.EMPLOYEE };

describe('EnrollmentsService', () => {
  it('create with no prior enrollment sets recertificationOf null', async () => {
    const { svc, enroll, courses, users } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    enroll.find.mockResolvedValue([]);
    users.findOne.mockResolvedValue({ id: 'u-1', companyId: 'co-1' });
    const res: any = await svc.create({ courseId: 'c-1' } as any, actor);
    expect(res.recertificationOf).toBeNull();
    expect(res.status).toBe('active');
  });

  it('create throws Conflict when active enrollment exists', async () => {
    const { svc, enroll, courses } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    enroll.find.mockResolvedValue([{ id: 'enr-old', status: 'active' }]);
    await expect(svc.create({ courseId: 'c-1' } as any, actor)).rejects.toThrow(ConflictException);
  });

  it('create with completed prior enrollment links recertificationOf', async () => {
    const { svc, enroll, courses, users } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    enroll.find.mockResolvedValue([{ id: 'enr-old', status: 'completed' }]);
    users.findOne.mockResolvedValue({ id: 'u-1', companyId: 'co-1' });
    const res: any = await svc.create({ courseId: 'c-1' } as any, actor);
    expect(res.recertificationOf).toBe('enr-old');
    expect(res.status).toBe('active');
  });

  it('recertify creates a new active row linked to the completed one', async () => {
    const { svc, enroll } = make();
    enroll.findOne
      .mockResolvedValueOnce({ id: 'enr-old', userId: 'u-1', courseId: 'c-1', companyId: null, status: 'completed' })
      .mockResolvedValueOnce(null); // no existing active
    const res: any = await svc.recertify('enr-old', actor);
    expect(res.recertificationOf).toBe('enr-old');
    expect(res.status).toBe('active');
  });

  it('recertify throws BadRequest when enrollment is not completed', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValueOnce({ id: 'enr-old', userId: 'u-1', courseId: 'c-1', status: 'active' });
    await expect(svc.recertify('enr-old', actor)).rejects.toThrow(BadRequestException);
  });

  it('recertify returns existing active recert if one already in progress', async () => {
    const { svc, enroll } = make();
    enroll.findOne
      .mockResolvedValueOnce({ id: 'enr-old', userId: 'u-1', courseId: 'c-1', status: 'completed' })
      .mockResolvedValueOnce({ id: 'enr-active', status: 'active', progressPct: 30, recertificationOf: 'enr-old' });
    const res: any = await svc.recertify('enr-old', actor);
    expect(res.id).toBe('enr-active');
  });

  it('recertify NotFound when enrollment missing', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue(null);
    await expect(svc.recertify('bad', actor)).rejects.toThrow(NotFoundException);
  });

  it('recertify Forbidden when actor is different user', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'enr-1', userId: 'other', courseId: 'c-1', status: 'completed' });
    await expect(svc.recertify('enr-1', actor)).rejects.toThrow(ForbiddenException);
  });

  it('listMine scopes to userId', async () => {
    const { svc, enroll } = make();
    enroll.find.mockResolvedValue([{ id: 'e-1' }]);
    const res = await svc.listMine(actor);
    expect(enroll.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u-1' } }));
    expect(res).toHaveLength(1);
  });

  it('list as admin returns all', async () => {
    const { svc, enroll } = make();
    enroll.find.mockResolvedValue([{ id: 'e-1' }]);
    const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
    const res = await svc.list(admin);
    expect(res).toHaveLength(1);
  });

  it('list as employee falls back to listMine', async () => {
    const { svc, enroll } = make();
    enroll.find.mockResolvedValue([]);
    await svc.list(actor);
    expect(enroll.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u-1' } }));
  });

  it('updateProgress bumps and completes triggering issueForEnrollment', async () => {
    const { svc, enroll, certificates } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', status: 'active', progressPct: 50 });
    const res: any = await svc.updateProgress('e-1', { progressPct: 100 } as any, actor);
    expect(res.status).toBe('completed');
    expect(res.completedAt).toBeInstanceOf(Date);
    // fire-and-forget — allow microtask
    await new Promise((r) => setImmediate(r));
    expect(certificates.issueForEnrollment).toHaveBeenCalledWith('e-1');
  });

  it('updateProgress with markCompleted flag completes without hitting 100', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', status: 'active', progressPct: 50 });
    const res: any = await svc.updateProgress('e-1', { progressPct: 60, markCompleted: true } as any, actor);
    expect(res.status).toBe('completed');
    expect(res.progressPct).toBe(100);
  });

  it('updateProgress Forbidden for other users', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'other', status: 'active', progressPct: 0 });
    await expect(svc.updateProgress('e-1', { progressPct: 50 } as any, actor)).rejects.toThrow(ForbiddenException);
  });

  it('updateProgress NotFound', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue(null);
    await expect(svc.updateProgress('bad', { progressPct: 50 } as any, actor)).rejects.toThrow(NotFoundException);
  });

  it('cancel sets status cancelled', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', status: 'active' });
    const res = await svc.cancel('e-1', actor);
    expect(res).toEqual({ id: 'e-1', cancelled: true });
  });

  it('cancel Forbidden for other user', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'other', status: 'active' });
    await expect(svc.cancel('e-1', actor)).rejects.toThrow(ForbiddenException);
  });

  it('completeModule bumps progress and records completion', async () => {
    const { svc, enroll, modules, completions } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', courseId: 'c-1', progressPct: 0 });
    modules.findOne.mockResolvedValue({ id: 'm-1', courseId: 'c-1' });
    completions.findOne.mockResolvedValue(null);
    modules.find.mockResolvedValue([{ id: 'm-1' }, { id: 'm-2' }]);
    completions.count.mockResolvedValue(1);
    const res = await svc.completeModule('e-1', 'm-1', actor);
    expect(res.modulesCompleted).toBe(1);
    expect(res.totalModules).toBe(2);
    expect(res.progressPct).toBe(50);
  });

  it('completeModule NotFound module not in course', async () => {
    const { svc, enroll, modules } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', courseId: 'c-1' });
    modules.findOne.mockResolvedValue(null);
    await expect(svc.completeModule('e-1', 'm-x', actor)).rejects.toThrow(NotFoundException);
  });

  it('bulkAssign admin creates enrollments and returns counts', async () => {
    const { svc, enroll, courses, users } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    enroll.findOne
      .mockResolvedValueOnce(null) // active check user-1
      .mockResolvedValueOnce(null) // prior check user-1
      .mockResolvedValueOnce(null) // active user-2
      .mockResolvedValueOnce(null); // prior user-2
    users.findOne.mockResolvedValue({ id: 'x', companyId: 'co-1' });
    const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
    const res = await svc.bulkAssign('c-1', ['u-1', 'u-2'], admin);
    expect(res.assigned).toBe(2);
    expect(res.skipped).toBe(0);
  });

  it('bulkAssign skips users already actively enrolled (idempotent)', async () => {
    const { svc, enroll, courses } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    enroll.findOne.mockResolvedValue({ id: 'existing', status: 'active' });
    const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
    const res = await svc.bulkAssign('c-1', ['u-1'], admin);
    expect(res.assigned).toBe(0);
    expect(res.skipped).toBe(1);
  });

  it('bulkAssign empty ids BadRequest', async () => {
    const { svc } = make();
    const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
    await expect(svc.bulkAssign('c-1', [], admin)).rejects.toThrow(BadRequestException);
  });

  it('bulkAssign Forbidden for employee role', async () => {
    const { svc, courses } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: true });
    await expect(svc.bulkAssign('c-1', ['u-1'], actor)).rejects.toThrow(ForbiddenException);
  });

  it('create NotFound when course missing', async () => {
    const { svc, courses } = make();
    courses.findOne.mockResolvedValue(null);
    await expect(svc.create({ courseId: 'x' } as any, actor)).rejects.toThrow(NotFoundException);
  });

  it('create BadRequest when course unpublished and actor not admin', async () => {
    const { svc, courses } = make();
    courses.findOne.mockResolvedValue({ id: 'c-1', isPublished: false });
    await expect(svc.create({ courseId: 'c-1' } as any, actor)).rejects.toThrow(BadRequestException);
  });

  it('getVideoWatch returns row for owner', async () => {
    const { svc, enroll, watches } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1' });
    watches.findOne.mockResolvedValue({ id: 'w-1' });
    const res = await svc.getVideoWatch('e-1', 'm-1', actor);
    expect(res?.id).toBe('w-1');
  });

  it('getVideoWatch Forbidden for other user', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'other' });
    await expect(svc.getVideoWatch('e-1', 'm-1', actor)).rejects.toThrow(ForbiddenException);
  });

  it('getVideoWatch NotFound when enrollment missing', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue(null);
    await expect(svc.getVideoWatch('bad', 'm-1', actor)).rejects.toThrow(NotFoundException);
  });

  it('reportVideoWatch creates new watch and auto-completes on >= 90%', async () => {
    const { svc, enroll, modules, watches, completions } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', courseId: 'c-1', progressPct: 0 });
    modules.findOne.mockResolvedValue({ id: 'm-1', courseId: 'c-1' });
    watches.findOne.mockResolvedValue(null);
    completions.findOne.mockResolvedValue(null);
    modules.find.mockResolvedValue([{ id: 'm-1' }, { id: 'm-2' }]);
    completions.count.mockResolvedValue(1);
    const res = await svc.reportVideoWatch(
      'e-1', 'm-1', { positionSec: 95, durationSec: 100 } as any, actor,
    );
    expect(res.autoCompleted).toBe(true);
    expect(res.watchedPct).toBe(95);
    expect(res.progressPct).toBe(50);
  });

  it('reportVideoWatch updates existing without completing when below 90%', async () => {
    const { svc, enroll, modules, watches } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', courseId: 'c-1', progressPct: 0 });
    modules.findOne.mockResolvedValue({ id: 'm-1', courseId: 'c-1' });
    watches.findOne.mockResolvedValue({ enrollmentId: 'e-1', moduleId: 'm-1', positionSec: 10, maxPositionSec: 20, durationSec: 100 });
    const res = await svc.reportVideoWatch(
      'e-1', 'm-1', { positionSec: 50 } as any, actor,
    );
    expect(res.autoCompleted).toBe(false);
    expect(res.maxPositionSec).toBe(50);
  });

  it('reportVideoWatch NotFound when module not part of course', async () => {
    const { svc, enroll, modules } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1', courseId: 'c-1' });
    modules.findOne.mockResolvedValue(null);
    await expect(
      svc.reportVideoWatch('e-1', 'm-x', { positionSec: 1 } as any, actor),
    ).rejects.toThrow(NotFoundException);
  });

  it('listMyCompletions returns completions for owner', async () => {
    const { svc, enroll, completions } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'u-1' });
    completions.find.mockResolvedValue([{ id: 'c-1' }]);
    const res = await svc.listMyCompletions('e-1', actor);
    expect(res).toHaveLength(1);
  });

  it('listMyCompletions Forbidden for other user', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'other' });
    await expect(svc.listMyCompletions('e-1', actor)).rejects.toThrow(ForbiddenException);
  });

  it('completeModule Forbidden for other user', async () => {
    const { svc, enroll } = make();
    enroll.findOne.mockResolvedValue({ id: 'e-1', userId: 'other', courseId: 'c-1' });
    await expect(svc.completeModule('e-1', 'm-1', actor)).rejects.toThrow(ForbiddenException);
  });

  it('list as client with company returns own-company user enrollments', async () => {
    const { svc, enroll, users } = make();
    users.findOne.mockResolvedValue({ id: 'ca', companyId: 'co-1' });
    users.createQueryBuilder = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([{ u_id: 'u-1' }, { u_id: 'u-2' }]),
    })) as any;
    enroll.find.mockResolvedValue([{ id: 'e-1' }]);
    const clientActor = { userId: 'ca', email: 'ca@x.com', role: Role.CLIENT_ADMIN };
    const res = await svc.list(clientActor);
    expect(res).toHaveLength(1);
  });

  it('list as client with no company returns []', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'ca', companyId: null });
    const clientActor = { userId: 'ca', email: 'ca@x.com', role: Role.CLIENT_ADMIN };
    expect(await svc.list(clientActor)).toEqual([]);
  });
});

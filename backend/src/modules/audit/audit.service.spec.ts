import { AuditService } from './audit.service';

function repo() {
  const qb: any = {
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };
  return {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockImplementation((v: any) => v),
    createQueryBuilder: jest.fn(() => qb),
    _qb: qb,
  } as any;
}

describe('AuditService', () => {
  it('record writes an audit entry with all fields normalized', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.record({
      actorId: 'a',
      actorEmail: 'a@x.com',
      actorRole: 'principal_admin',
      action: 'user.create',
      entityType: 'user',
      entityId: 'u-1',
      metadata: { foo: 'bar' },
      ip: '1.1.1.1',
      userAgent: 'jest',
    });
    expect(r.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'a',
        action: 'user.create',
        entityId: 'u-1',
        metadata: { foo: 'bar' },
      }),
    );
    expect(r.save).toHaveBeenCalled();
  });

  it('record normalizes missing optionals to null', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.record({ action: 'x' });
    expect(r.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: null,
        actorEmail: null,
        entityId: null,
        metadata: null,
      }),
    );
  });

  it('record swallows repo errors (never throws)', async () => {
    const r = repo();
    r.save.mockRejectedValue(new Error('db down'));
    const svc = new AuditService(r);
    await expect(svc.record({ action: 'x' })).resolves.toBeUndefined();
  });

  it('list applies entityType filter', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.list({ entityType: 'user' });
    expect(r._qb.andWhere).toHaveBeenCalledWith('a.entity_type = :et', { et: 'user' });
  });

  it('list applies entityId filter', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.list({ entityId: 'u-1' });
    expect(r._qb.andWhere).toHaveBeenCalledWith('a.entity_id = :ei', { ei: 'u-1' });
  });

  it('list applies actorId filter', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.list({ actorId: 'a' });
    expect(r._qb.andWhere).toHaveBeenCalledWith('a.actor_id = :aid', { aid: 'a' });
  });

  it('list uses default limit 200 when unspecified', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.list();
    expect(r._qb.limit).toHaveBeenCalledWith(200);
  });

  it('list uses provided limit', async () => {
    const r = repo();
    const svc = new AuditService(r);
    await svc.list({ limit: 50 });
    expect(r._qb.limit).toHaveBeenCalledWith(50);
  });
});

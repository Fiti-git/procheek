import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TrainingService } from './training.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'row', ...v })),
    create: jest.fn().mockImplementation((v: any) => v),
    count: jest.fn().mockResolvedValue(0),
  } as any;
}

function make() {
  const trainers = repo();
  const appointments = repo();
  const sessions = repo();
  const vendors = repo();
  const users = repo();
  const svc = new TrainingService(trainers, appointments, sessions, vendors, users);
  return { svc, trainers, appointments, sessions, vendors, users };
}

const admin = { userId: 'a', email: 'a@x.com', role: Role.PRINCIPAL_ADMIN };
const capacitador = { userId: 'cap', email: 'c@x.com', role: Role.CAPACITADOR };
const employee = { userId: 'e', email: 'e@x.com', role: Role.EMPLOYEE };

describe('TrainingService sessions', () => {
  it('createSession as capacitador uses own id', async () => {
    const { svc } = make();
    const res: any = await svc.createSession(
      { title: 'S', scheduledAt: new Date().toISOString() } as any,
      capacitador,
    );
    expect(res.capacitadorId).toBe('cap');
    expect(res.status).toBe('scheduled');
  });

  it('createSession as admin without id BadRequest', async () => {
    const { svc } = make();
    await expect(
      svc.createSession({ title: 'S', scheduledAt: new Date().toISOString() } as any, admin),
    ).rejects.toThrow(BadRequestException);
  });

  it('createSession by employee Forbidden', async () => {
    const { svc } = make();
    await expect(
      svc.createSession({ title: 'S', scheduledAt: new Date().toISOString() } as any, employee),
    ).rejects.toThrow(ForbiddenException);
  });

  it('updateSession as owner applies changes and sets deliveredAt', async () => {
    const { svc, sessions } = make();
    sessions.findOne.mockResolvedValue({ id: 's-1', capacitadorId: 'cap', deliveredAt: null });
    const res: any = await svc.updateSession('s-1', { status: 'delivered' } as any, capacitador);
    expect(res.status).toBe('delivered');
    expect(res.deliveredAt).toBeInstanceOf(Date);
  });

  it('updateSession by non-owner Forbidden', async () => {
    const { svc, sessions } = make();
    sessions.findOne.mockResolvedValue({ id: 's-1', capacitadorId: 'other' });
    await expect(svc.updateSession('s-1', {} as any, capacitador)).rejects.toThrow(ForbiddenException);
  });

  it('updateSession NotFound', async () => {
    const { svc, sessions } = make();
    sessions.findOne.mockResolvedValue(null);
    await expect(svc.updateSession('x', {} as any, admin)).rejects.toThrow(NotFoundException);
  });

  it('listSessions admin returns all', async () => {
    const { svc, sessions } = make();
    sessions.find.mockResolvedValue([{ id: 's-1' }]);
    expect(await svc.listSessions(admin)).toHaveLength(1);
  });

  it('listSessions capacitador scoped', async () => {
    const { svc, sessions } = make();
    sessions.find.mockResolvedValue([]);
    await svc.listSessions(capacitador);
    expect(sessions.find).toHaveBeenCalledWith(expect.objectContaining({ where: { capacitadorId: 'cap' } }));
  });

  it('listSessions employee Forbidden', async () => {
    const { svc } = make();
    await expect(svc.listSessions(employee)).rejects.toThrow(ForbiddenException);
  });
});

describe('TrainingService appointments', () => {
  it('createAppointment public path allowed without actor', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'cap', role: Role.CAPACITADOR });
    const res: any = await svc.createAppointment({
      requester_kind: 'public',
      requester_contact_name: 'Ale',
      requester_email: 'a@x.com',
      assigned_user_id: 'cap',
      purpose: 'consulting',
      scheduled_at: new Date().toISOString(),
    } as any);
    expect(res.status).toBe('requested');
    expect(res.assignedRole).toBe('capacitador');
  });

  it('createAppointment non-public requires actor', async () => {
    const { svc } = make();
    await expect(svc.createAppointment({
      requester_kind: 'authenticated',
      requester_contact_name: 'X',
      requester_email: 'x@x.com',
      assigned_user_id: 'u',
      purpose: 'training',
      scheduled_at: new Date().toISOString(),
    } as any)).rejects.toThrow(ForbiddenException);
  });

  it('createAppointment rejects wrong assigned role', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue({ id: 'e', role: Role.EMPLOYEE });
    await expect(svc.createAppointment({
      requester_kind: 'public',
      requester_contact_name: 'X',
      requester_email: 'x@x.com',
      assigned_user_id: 'e',
      purpose: 'demo',
      scheduled_at: new Date().toISOString(),
    } as any)).rejects.toThrow(BadRequestException);
  });

  it('createAppointment NotFound when assigned user missing', async () => {
    const { svc, users } = make();
    users.findOne.mockResolvedValue(null);
    await expect(svc.createAppointment({
      requester_kind: 'public',
      requester_contact_name: 'X',
      requester_email: 'x@x.com',
      assigned_user_id: 'bad',
      purpose: 'demo',
      scheduled_at: new Date().toISOString(),
    } as any)).rejects.toThrow(NotFoundException);
  });

  it('updateAppointment by assignee works', async () => {
    const { svc, appointments } = make();
    appointments.findOne.mockResolvedValue({ id: 'a-1', assignedUserId: 'cap', status: 'requested' });
    const res: any = await svc.updateAppointment('a-1', { status: 'confirmed' } as any, capacitador);
    expect(res.status).toBe('confirmed');
  });

  it('updateAppointment by non-owner Forbidden', async () => {
    const { svc, appointments } = make();
    appointments.findOne.mockResolvedValue({ id: 'a-1', assignedUserId: 'other' });
    await expect(svc.updateAppointment('a-1', {} as any, capacitador)).rejects.toThrow(ForbiddenException);
  });

  it('listAppointments admin returns all', async () => {
    const { svc, appointments } = make();
    appointments.find.mockResolvedValue([{ id: 'a-1' }]);
    expect(await svc.listAppointments(admin)).toHaveLength(1);
  });
});

describe('TrainingService dashboardSummary', () => {
  it('aggregates hours delivered and avg attendees', async () => {
    const { svc, sessions, appointments } = make();
    sessions.find.mockResolvedValue([
      { status: 'delivered', durationHours: 4, attendeeCount: 10 },
      { status: 'scheduled', durationHours: 2, attendeeCount: 5 },
    ]);
    appointments.count.mockResolvedValue(3);
    const res = await svc.dashboardSummary(capacitador);
    expect(res.sessions_this_month).toBe(2);
    expect(res.hours_delivered).toBe(4);
    expect(res.avg_attendees).toBe(7.5);
    expect(res.upcoming_appointments).toBe(3);
  });

  it('dashboardSummary rejects employee', async () => {
    const { svc } = make();
    await expect(svc.dashboardSummary(employee)).rejects.toThrow(ForbiddenException);
  });
});

describe('TrainingService listAvailable and profiles', () => {
  it('listAvailable returns capacitador with specialties', async () => {
    const { svc, users, trainers } = make();
    users.find.mockResolvedValue([{ id: 'cap', role: Role.CAPACITADOR, firstName: 'C', lastName: 'A', email: 'c@x.com' }]);
    trainers.findOne.mockResolvedValue({ userId: 'cap', specialties: ['NOM-035'], bio: 'Bio', isActive: true });
    const res = await svc.listAvailable('consulting');
    expect(res).toHaveLength(1);
    expect(res[0].specialties).toEqual(['NOM-035']);
    expect(res[0].available_slots.length).toBeGreaterThan(0);
  });

  it('listAvailable skips inactive profiles', async () => {
    const { svc, users, trainers } = make();
    users.find.mockResolvedValue([{ id: 'cap', role: Role.CAPACITADOR, firstName: 'C', lastName: 'A', email: 'c@x.com' }]);
    trainers.findOne.mockResolvedValue({ userId: 'cap', specialties: [], bio: '', isActive: false });
    const res = await svc.listAvailable('consulting');
    expect(res).toHaveLength(0);
  });

  it('getTrainerProfile NotFound', async () => {
    const { svc, trainers } = make();
    trainers.findOne.mockResolvedValue(null);
    await expect(svc.getTrainerProfile('cap', capacitador)).rejects.toThrow(NotFoundException);
  });

  it('getTrainerProfile Forbidden for other user', async () => {
    const { svc } = make();
    await expect(svc.getTrainerProfile('someone-else', capacitador)).rejects.toThrow(ForbiddenException);
  });
});

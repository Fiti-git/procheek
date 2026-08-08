import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { PaymentsService } from './payments.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'evt-1', ...v })),
    delete: jest.fn(),
    create: jest.fn().mockImplementation((v: any) => v),
  } as any;
}

function makeService(overrides: Partial<Record<string, any>> = {}) {
  const payments = overrides.payments ?? repo();
  const invoices = overrides.invoices ?? repo();
  const courses = overrides.courses ?? repo();
  const users = overrides.users ?? repo();
  const enrollments = overrides.enrollments ?? repo();
  const webhookEvents = overrides.webhookEvents ?? repo();
  const config = overrides.config ?? {
    get: jest.fn((key: string, def?: any) => {
      if (key === 'WEBHOOK_SECRET') return 'test-secret';
      if (key === 'PAYMENTS_MODE') return 'production';
      return def;
    }),
  };
  const audit = overrides.audit ?? { record: jest.fn().mockResolvedValue(undefined) };
  const svc = new PaymentsService(
    payments,
    invoices,
    courses,
    users,
    enrollments,
    webhookEvents,
    config as any,
    audit as any,
  );
  return { svc, payments, invoices, courses, users, enrollments, webhookEvents, config, audit };
}

function signBody(body: string, secret = 'test-secret') {
  return 'sha256=' + createHmac('sha256', secret).update(Buffer.from(body)).digest('hex');
}

describe('PaymentsService', () => {
  describe('verifySignature (via handleWebhook)', () => {
    it('accepts valid HMAC-SHA256 signature', async () => {
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(null);
      const raw = JSON.stringify({ provider_ref: 'p1', status: 'succeeded' });
      const sig = signBody(raw);
      const res = await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: sig,
      });
      expect(res.verified).toBe(true);
    });

    it('rejects wrong signature', async () => {
      const { svc } = makeService();
      const raw = JSON.stringify({ provider_ref: 'p1', status: 'succeeded' });
      await expect(
        svc.handleWebhook({
          payload: JSON.parse(raw),
          rawBody: Buffer.from(raw),
          signatureHeader: 'sha256=deadbeef',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('skips verification when PAYMENTS_MODE=stub', async () => {
      const config = {
        get: jest.fn((key: string, def?: any) => {
          if (key === 'PAYMENTS_MODE') return 'stub';
          if (key === 'WEBHOOK_SECRET') return 'test-secret';
          return def;
        }),
      };
      const { svc, payments } = makeService({ config });
      payments.findOne.mockResolvedValue(null);
      const res = await svc.handleWebhook({
        payload: { provider_ref: 'p1', status: 'succeeded' },
      });
      expect(res.verified).toBe(true);
    });
  });

  describe('handleWebhook status transitions', () => {
    it('verified succeeded event flips payment to paid and sets timestamps', async () => {
      const existing = {
        id: 'pay-1',
        providerRef: 'ref-1',
        status: 'pending',
        userId: 'u-1',
        items: [],
        paidAt: null,
        webhookReceivedAt: null,
      };
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(existing);
      const raw = JSON.stringify({ provider_ref: 'ref-1', status: 'succeeded' });
      await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: signBody(raw),
      });
      expect(existing.status).toBe('paid');
      expect(existing.paidAt).toBeInstanceOf(Date);
      expect(existing.webhookReceivedAt).toBeInstanceOf(Date);
      expect(payments.save).toHaveBeenCalledWith(existing);
    });

    it('verified failed event leaves status unchanged', async () => {
      const existing = { id: 'pay-1', providerRef: 'ref-1', status: 'pending', userId: 'u-1', items: [], paidAt: null };
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(existing);
      const raw = JSON.stringify({ provider_ref: 'ref-1', status: 'failed' });
      await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: signBody(raw),
      });
      expect(existing.status).toBe('pending');
    });

    it('unverified signature throws UnauthorizedException and does not flip status', async () => {
      const existing = { id: 'pay-1', providerRef: 'ref-1', status: 'pending', userId: 'u-1', items: [] };
      const { svc, payments, webhookEvents } = makeService();
      payments.findOne.mockResolvedValue(existing);
      const raw = JSON.stringify({ provider_ref: 'ref-1', status: 'succeeded' });
      await expect(
        svc.handleWebhook({
          payload: JSON.parse(raw),
          rawBody: Buffer.from(raw),
          signatureHeader: 'sha256=bad',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(existing.status).toBe('pending');
      expect(webhookEvents.create).toHaveBeenCalledWith(
        expect.objectContaining({ verified: false }),
      );
    });

    it('already-paid payment stays paid (idempotent set)', async () => {
      const existing = {
        id: 'pay-1',
        providerRef: 'ref-1',
        status: 'paid',
        userId: 'u-1',
        items: [],
        paidAt: new Date('2024-01-01'),
      };
      const originalPaidAt = existing.paidAt;
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(existing);
      const raw = JSON.stringify({ provider_ref: 'ref-1', status: 'succeeded' });
      await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: signBody(raw),
      });
      expect(existing.status).toBe('paid');
      expect(existing.paidAt).toBe(originalPaidAt);
    });

    it('auto-enroll fires when status flips to paid', async () => {
      const existing = {
        id: 'pay-1',
        providerRef: 'ref-1',
        status: 'pending',
        userId: 'u-1',
        companyId: 'co-1',
        items: [{ courseId: 'c-1', qty: 1, priceMxn: 100 }, { courseId: 'c-2', qty: 1, priceMxn: 200 }],
        paidAt: null,
      };
      const { svc, payments, enrollments, audit } = makeService();
      payments.findOne.mockResolvedValue(existing);
      enrollments.findOne.mockResolvedValue(null);
      enrollments.save.mockImplementation((v: any) => Promise.resolve({ id: 'enr-' + v.courseId, ...v }));
      const raw = JSON.stringify({ provider_ref: 'ref-1', status: 'succeeded' });
      await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: signBody(raw),
      });
      expect(enrollments.save).toHaveBeenCalledTimes(2);
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'payment.auto_enrolled',
          metadata: expect.objectContaining({ courseIds: ['c-1', 'c-2'] }),
        }),
      );
    });

    it('simulateWebhook bypasses signature verification and triggers side effects', async () => {
      const existing = { id: 'pay-1', providerRef: 'ref-1', status: 'pending', userId: 'u-1', items: [], amountMxn: 100, currency: 'MXN', paidAt: null };
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(existing);
      const res = await svc.simulateWebhook('pay-1');
      expect(res.verified).toBe(true);
      expect(existing.status).toBe('paid');
    });

    it('writes webhook event log entry with verified flag on verified attempt', async () => {
      const { svc, payments, webhookEvents } = makeService();
      payments.findOne.mockResolvedValue(null);
      const raw = JSON.stringify({ provider_ref: 'r', status: 'succeeded', event_id: 'ev-1' });
      await svc.handleWebhook({
        payload: JSON.parse(raw),
        rawBody: Buffer.from(raw),
        signatureHeader: signBody(raw),
      });
      expect(webhookEvents.create).toHaveBeenCalledWith(
        expect.objectContaining({ verified: true, eventId: 'ev-1' }),
      );
      expect(webhookEvents.save).toHaveBeenCalled();
    });

    it('logs unverified event before throwing', async () => {
      const { svc, webhookEvents } = makeService();
      const raw = JSON.stringify({ provider_ref: 'r', status: 'succeeded' });
      await expect(
        svc.handleWebhook({
          payload: JSON.parse(raw),
          rawBody: Buffer.from(raw),
          signatureHeader: 'sha256=bad',
        }),
      ).rejects.toThrow();
      expect(webhookEvents.create).toHaveBeenCalledWith(
        expect.objectContaining({ verified: false }),
      );
      expect(webhookEvents.save).toHaveBeenCalled();
    });
  });

  describe('checkout', () => {
    const actor = { userId: 'u-1', email: 'u@x.com', role: Role.EMPLOYEE };

    it('creates payment + invoice + enrollments for published courses', async () => {
      const { svc, payments, invoices, courses, users, enrollments } = makeService();
      courses.find.mockResolvedValue([
        { id: 'c-1', slug: 'c1', priceMxn: 100, isPublished: true },
        { id: 'c-2', slug: 'c2', priceMxn: 200, isPublished: true },
      ]);
      users.findOne.mockResolvedValue({ id: 'u-1', companyId: 'co-1' });
      enrollments.findOne.mockResolvedValue(null);
      enrollments.save.mockImplementation((v: any) =>
        Promise.resolve({ id: 'enr-' + v.courseId, ...v }),
      );
      const res: any = await svc.checkout(
        { items: [{ courseId: 'c-1', qty: 1 }, { courseId: 'c-2', qty: 2 }] } as any,
        actor,
      );
      // 100 + 400 = 500 subtotal; 16% IVA = 80; total 580
      expect(res.invoice.subtotalMxn).toBe(500);
      expect(res.invoice.taxMxn).toBe(80);
      expect(res.invoice.totalMxn).toBe(580);
      expect(res.enrollmentIds).toHaveLength(2);
      expect(payments.save).toHaveBeenCalled();
      expect(invoices.save).toHaveBeenCalled();
    });

    it('throws BadRequest when a course is missing', async () => {
      const { svc, courses, users } = makeService();
      courses.find.mockResolvedValue([]);
      users.findOne.mockResolvedValue({ id: 'u-1' });
      await expect(
        svc.checkout({ items: [{ courseId: 'c-1', qty: 1 }] } as any, actor),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequest when a course is unpublished', async () => {
      const { svc, courses, users } = makeService();
      courses.find.mockResolvedValue([{ id: 'c-1', slug: 'c1', priceMxn: 100, isPublished: false }]);
      users.findOne.mockResolvedValue({ id: 'u-1' });
      await expect(
        svc.checkout({ items: [{ courseId: 'c-1', qty: 1 }] } as any, actor),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when acting user does not exist', async () => {
      const { svc, courses, users } = makeService();
      courses.find.mockResolvedValue([{ id: 'c-1', slug: 'c1', priceMxn: 100, isPublished: true }]);
      users.findOne.mockResolvedValue(null);
      await expect(
        svc.checkout({ items: [{ courseId: 'c-1', qty: 1 }] } as any, actor),
      ).rejects.toThrow(NotFoundException);
    });

    it('employee enrolling another user is BadRequest', async () => {
      const { svc, courses, users } = makeService();
      courses.find.mockResolvedValue([{ id: 'c-1', slug: 'c1', priceMxn: 100, isPublished: true }]);
      users.findOne.mockResolvedValue({ id: 'u-1' });
      await expect(
        svc.checkout(
          { items: [{ courseId: 'c-1', qty: 1 }], enrollUserId: 'other' } as any,
          actor,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('skips duplicate enrollment', async () => {
      const { svc, courses, users, enrollments } = makeService();
      courses.find.mockResolvedValue([{ id: 'c-1', slug: 'c1', priceMxn: 100, isPublished: true }]);
      users.findOne.mockResolvedValue({ id: 'u-1' });
      enrollments.findOne.mockResolvedValue({ id: 'existing' });
      const res: any = await svc.checkout({ items: [{ courseId: 'c-1', qty: 1 }] } as any, actor);
      expect(res.enrollmentIds).toEqual([]);
      expect(enrollments.save).not.toHaveBeenCalled();
    });
  });

  describe('listMine and invoice access', () => {
    const actor = { userId: 'u-1', email: 'u@x.com', role: Role.EMPLOYEE };

    it('listMine scopes to userId', async () => {
      const { svc, payments } = makeService();
      payments.find.mockResolvedValue([{ id: 'p-1' }]);
      const res = await svc.listMine(actor);
      expect(payments.find).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'u-1' } }));
      expect(res).toHaveLength(1);
    });

    it('findInvoiceForUser returns for owner', async () => {
      const { svc, payments, invoices } = makeService();
      invoices.findOne.mockResolvedValue({ id: 'i-1', paymentId: 'p-1' });
      payments.findOne.mockResolvedValue({ id: 'p-1', userId: 'u-1' });
      const res = await svc.findInvoiceForUser('i-1', actor);
      expect(res.invoice.id).toBe('i-1');
    });

    it('findInvoiceForUser NotFound for foreign user', async () => {
      const { svc, payments, invoices } = makeService();
      invoices.findOne.mockResolvedValue({ id: 'i-1', paymentId: 'p-1' });
      payments.findOne.mockResolvedValue({ id: 'p-1', userId: 'other' });
      await expect(svc.findInvoiceForUser('i-1', actor)).rejects.toThrow(NotFoundException);
    });

    it('findInvoiceForUser NotFound when invoice missing', async () => {
      const { svc, invoices } = makeService();
      invoices.findOne.mockResolvedValue(null);
      await expect(svc.findInvoiceForUser('i-1', actor)).rejects.toThrow(NotFoundException);
    });

    it('myInvoices returns empty when no payments', async () => {
      const { svc, payments } = makeService();
      payments.find.mockResolvedValue([]);
      expect(await svc.myInvoices(actor)).toEqual([]);
    });

    it('myInvoices returns invoices for user payments', async () => {
      const { svc, payments, invoices } = makeService();
      payments.find.mockResolvedValue([{ id: 'p-1' }]);
      invoices.find.mockResolvedValue([{ id: 'i-1' }]);
      const res = await svc.myInvoices(actor);
      expect(res).toHaveLength(1);
    });

    it('simulateWebhook missing payment throws NotFound', async () => {
      const { svc, payments } = makeService();
      payments.findOne.mockResolvedValue(null);
      await expect(svc.simulateWebhook('bad')).rejects.toThrow(NotFoundException);
    });

    it('getCourses returns [] when no ids', async () => {
      const { svc } = makeService();
      expect(await svc.getCourses([])).toEqual([]);
    });
  });
});

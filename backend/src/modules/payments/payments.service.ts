import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { In, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { Invoice } from './invoice.entity';
import { PaymentWebhookEvent } from './payment-webhook-event.entity';
import { CheckoutDto } from './dto/checkout.dto';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Role } from '../../common/roles';
import { AuditService } from '../audit/audit.service';

export interface RequestUser {
  userId: string;
  email: string;
  role: Role;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `PC-${year}-${suffix}`;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Course) private readonly courses: Repository<Course>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Enrollment) private readonly enrollments: Repository<Enrollment>,
    @InjectRepository(PaymentWebhookEvent) private readonly webhookEvents: Repository<PaymentWebhookEvent>,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  private verifySignature(rawBody: Buffer | undefined, signatureHeader: string | undefined): boolean {
    const secret = this.config.get<string>('WEBHOOK_SECRET', 'dev-webhook-secret');
    if (!rawBody || !signatureHeader) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const given = signatureHeader.startsWith('sha256=') ? signatureHeader.slice(7) : signatureHeader;
    try {
      const a = Buffer.from(expected, 'hex');
      const b = Buffer.from(given, 'hex');
      if (a.length !== b.length) return false;
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  async handleWebhook(params: {
    payload: any;
    rawBody?: Buffer;
    signatureHeader?: string;
    skipVerification?: boolean;
  }) {
    const { payload, rawBody, signatureHeader } = params;
    const mode = (this.config.get<string>('PAYMENTS_MODE') || '').toLowerCase();
    const stubMode = params.skipVerification || mode === 'stub';

    let verified = false;
    if (stubMode) {
      this.logger.warn('Webhook signature verification skipped (stub mode)');
      verified = true;
    } else {
      verified = this.verifySignature(rawBody, signatureHeader);
    }

    const event = await this.webhookEvents.save(
      this.webhookEvents.create({
        providerRef: payload?.provider_ref ?? null,
        eventId: payload?.event_id ?? null,
        payloadJson: payload ?? {},
        signature: signatureHeader ?? null,
        verified,
        processedAt: null,
      }),
    );

    if (!verified) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const status = String(payload?.status || '').toLowerCase();
    let payment: Payment | null = null;

    if (payload?.provider_ref) {
      payment = await this.payments.findOne({ where: { providerRef: payload.provider_ref } });
    }

    if (payment && (status === 'succeeded' || status === 'paid')) {
      payment.status = 'paid';
      payment.paidAt = payment.paidAt ?? new Date();
      payment.webhookReceivedAt = new Date();
      await this.payments.save(payment);

      if (payment.userId) {
        const items = (payment.items ?? []) as Array<{ courseId: string; qty: number; priceMxn: number }>;
        const createdIds: string[] = [];
        for (const it of items) {
          // Skip only if an ACTIVE enrollment already exists (recert is a separate flow).
          const activeExisting = await this.enrollments.findOne({
            where: { userId: payment.userId, courseId: it.courseId, status: 'active' },
          });
          if (activeExisting) continue;
          const created = await this.enrollments.save(
            this.enrollments.create({
              userId: payment.userId,
              courseId: it.courseId,
              companyId: payment.companyId,
              status: 'active',
              progressPct: 0,
            }),
          );
          createdIds.push(created.id);
        }
        if (createdIds.length > 0) {
          await this.audit.record({
            actorId: payment.userId,
            action: 'payment.auto_enrolled',
            entityType: 'payment',
            entityId: payment.id,
            metadata: {
              paymentId: payment.id,
              enrollmentIds: createdIds,
              courseIds: items.map((i) => i.courseId),
            },
          });
        }
      }
    }

    event.processedAt = new Date();
    await this.webhookEvents.save(event);

    return {
      ok: true,
      eventId: event.id,
      verified,
      paymentId: payment?.id ?? null,
      paymentStatus: payment?.status ?? null,
    };
  }

  async simulateWebhook(paymentId: string, statusOverride?: string) {
    const payment = await this.payments.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    const payload = {
      provider_ref: payment.providerRef ?? `sim-${payment.id}`,
      status: statusOverride ?? 'succeeded',
      amount: payment.amountMxn,
      currency: payment.currency,
      event_id: `sim-${Date.now()}`,
    };
    return this.handleWebhook({ payload, skipVerification: true });
  }

  async checkout(dto: CheckoutDto, actor: RequestUser) {
    const courseIds = dto.items.map((i) => i.courseId);
    const courses = await this.courses.find({ where: { id: In(courseIds) } });
    if (courses.length !== courseIds.length) {
      throw new BadRequestException('One or more courses not found');
    }
    const unpublished = courses.find((c) => !c.isPublished);
    if (unpublished) throw new BadRequestException(`Course ${unpublished.slug} is not available`);

    const acting = await this.users.findOne({ where: { id: actor.userId } });
    if (!acting) throw new NotFoundException('User not found');

    const enrollUserId = dto.enrollUserId ?? actor.userId;
    if (enrollUserId !== actor.userId && ![Role.PRINCIPAL_ADMIN, Role.CLIENT_ADMIN, Role.CLIENT].includes(actor.role)) {
      throw new BadRequestException('Cannot enroll another user');
    }

    // Build payment.
    let subtotal = 0;
    const items = dto.items.map((i) => {
      const course = courses.find((c) => c.id === i.courseId)!;
      const line = course.priceMxn * i.qty;
      subtotal += line;
      return { courseId: i.courseId, qty: i.qty, priceMxn: course.priceMxn };
    });
    const tax = Math.round(subtotal * 0.16 * 100) / 100; // IVA 16%
    const total = Math.round((subtotal + tax) * 100) / 100;

    const payment = await this.payments.save(
      this.payments.create({
        userId: acting.id,
        companyId: acting.companyId,
        amountMxn: total,
        status: 'paid',
        provider: 'stub',
        providerRef: `stub-${Date.now()}`,
        items,
        paidAt: new Date(),
      }),
    );

    // Invoice.
    const invoice = await this.invoices.save(
      this.invoices.create({
        paymentId: payment.id,
        companyId: acting.companyId,
        number: generateInvoiceNumber(),
        subtotalMxn: subtotal,
        taxMxn: tax,
        totalMxn: total,
      }),
    );

    // Auto-enroll (skip duplicates).
    const created: string[] = [];
    for (const it of items) {
      const already = await this.enrollments.findOne({ where: { userId: enrollUserId, courseId: it.courseId } });
      if (already) continue;
      const enr = await this.enrollments.save(
        this.enrollments.create({
          userId: enrollUserId,
          courseId: it.courseId,
          companyId: acting.companyId,
          status: 'active',
          progressPct: 0,
        }),
      );
      created.push(enr.id);
    }

    return {
      payment: {
        id: payment.id,
        amountMxn: payment.amountMxn,
        status: payment.status,
        paidAt: payment.paidAt,
      },
      invoice: {
        id: invoice.id,
        number: invoice.number,
        subtotalMxn: invoice.subtotalMxn,
        taxMxn: invoice.taxMxn,
        totalMxn: invoice.totalMxn,
      },
      enrollmentIds: created,
    };
  }

  async listMine(actor: RequestUser) {
    return this.payments.find({ where: { userId: actor.userId }, order: { createdAt: 'DESC' } });
  }

  async findInvoiceForUser(invoiceId: string, actor: RequestUser) {
    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const payment = await this.payments.findOne({ where: { id: invoice.paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.userId !== actor.userId && actor.role !== Role.PRINCIPAL_ADMIN) {
      throw new NotFoundException('Invoice not found');
    }
    return { invoice, payment };
  }

  getCourses(ids: string[]) {
    if (ids.length === 0) return Promise.resolve([]);
    return this.courses.find({ where: { id: In(ids) } });
  }

  getUser(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async myInvoices(actor: RequestUser) {
    const mine = await this.payments.find({ where: { userId: actor.userId } });
    const ids = mine.map((p) => p.id);
    if (ids.length === 0) return [];
    return this.invoices.find({ where: { paymentId: In(ids) }, order: { issuedAt: 'DESC' } });
  }
}

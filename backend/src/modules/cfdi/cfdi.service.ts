import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../payments/invoice.entity';
import { Payment } from '../payments/payment.entity';
import { Role } from '../../common/roles';
import { CFDI_PROVIDER_TOKEN, CfdiProvider } from './providers/cfdi-provider.interface';

export interface CfdiRequestUser {
  userId: string;
  email: string;
  role: Role;
}

@Injectable()
export class CfdiService {
  constructor(
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @Inject(CFDI_PROVIDER_TOKEN) private readonly provider: CfdiProvider,
  ) {}

  private async loadInvoiceForActor(invoiceId: string, actor: CfdiRequestUser) {
    const invoice = await this.invoices.findOne({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    const payment = await this.payments.findOne({ where: { id: invoice.paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (actor.role !== Role.PRINCIPAL_ADMIN && payment.userId !== actor.userId) {
      throw new ForbiddenException('Not allowed');
    }
    return { invoice, payment };
  }

  async issue(invoiceId: string, actor: CfdiRequestUser) {
    const { invoice } = await this.loadInvoiceForActor(invoiceId, actor);
    if (invoice.cfdiUuid) {
      throw new BadRequestException('Invoice already has a CFDI');
    }
    const result = await this.provider.issueInvoice({
      invoiceId: invoice.id,
      number: invoice.number,
      totalMxn: invoice.totalMxn,
      subtotalMxn: invoice.subtotalMxn,
      taxMxn: invoice.taxMxn,
      currency: 'MXN',
    });

    await this.invoices.query(
      `UPDATE invoices
         SET cfdi_uuid = $1,
             cfdi_xml_url = $2,
             stamped_at = $3,
             cfdi_status = $4
       WHERE id = $5`,
      [result.uuid, result.xmlUrl, result.stampedAt, result.status, invoice.id],
    );

    return this.getStatus(invoice.id, actor);
  }

  async cancel(invoiceId: string, reason: string, actor: CfdiRequestUser) {
    if (!reason || reason.trim().length < 3) {
      throw new BadRequestException('Reason required');
    }
    const { invoice } = await this.loadInvoiceForActor(invoiceId, actor);
    if (!invoice.cfdiUuid) {
      throw new BadRequestException('Invoice has no CFDI to cancel');
    }
    const result = await this.provider.cancelInvoice(invoice.cfdiUuid, reason);

    await this.invoices.query(
      `UPDATE invoices
         SET cfdi_canceled_at = $1,
             cfdi_reason = $2,
             cfdi_status = $3
       WHERE id = $4`,
      [result.canceledAt, reason, result.status, invoice.id],
    );

    return this.getStatus(invoice.id, actor);
  }

  async getStatus(invoiceId: string, actor: CfdiRequestUser) {
    const { invoice } = await this.loadInvoiceForActor(invoiceId, actor);
    const raw = await this.invoices.query(
      `SELECT stamped_at, cfdi_canceled_at, cfdi_reason, cfdi_status FROM invoices WHERE id = $1`,
      [invoice.id],
    );
    const row = raw?.[0] ?? {};
    return {
      invoiceId: invoice.id,
      number: invoice.number,
      cfdiUuid: invoice.cfdiUuid,
      cfdiXmlUrl: invoice.cfdiXmlUrl,
      status: row.cfdi_status ?? (invoice.cfdiUuid ? 'STAMPED' : 'NONE'),
      stampedAt: row.stamped_at ?? null,
      canceledAt: row.cfdi_canceled_at ?? null,
      reason: row.cfdi_reason ?? null,
      provider: this.provider.name,
    };
  }
}

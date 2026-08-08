import { Body, Controller, ForbiddenException, Get, Headers, Param, ParseUUIDPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentsService, RequestUser } from './payments.service';
import { CheckoutDto } from './dto/checkout.dto';
import { SimulateWebhookDto } from './dto/webhook.dto';
import { renderInvoicePdf } from '../certificates/pdf';
import { Role } from '../../common/roles';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}

  @Post('webhook')
  webhook(
    @Req() req: any,
    @Headers('x-webhook-signature') signature: string,
  ) {
    return this.svc.handleWebhook({
      payload: req.body,
      rawBody: req.rawBody,
      signatureHeader: signature,
    });
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('checkout')
  checkout(@Body() dto: CheckoutDto, @Req() req: any) {
    return this.svc.checkout(dto, req.user as RequestUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  mine(@Req() req: any) {
    return this.svc.listMine(req.user as RequestUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/invoices')
  invoices(@Req() req: any) {
    return this.svc.myInvoices(req.user as RequestUser);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('invoices/:id/pdf')
  async invoicePdf(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { invoice, payment } = await this.svc.findInvoiceForUser(id, req.user as RequestUser);
    const items = (payment.items ?? []) as Array<{ courseId: string; qty: number; priceMxn: number }>;
    const courses = await this.svc.getCourses(items.map((i) => i.courseId));
    const buyer = await this.svc.getUser(payment.userId!);
    const stream = renderInvoicePdf({
      number: invoice.number,
      issuedAt: invoice.issuedAt,
      buyerName: buyer ? `${buyer.firstName} ${buyer.lastName}` : '-',
      buyerEmail: buyer?.email ?? '-',
      buyerCompany: null,
      buyerRfc: null,
      cfdiUuid: invoice.cfdiUuid,
      lines: items.map((i) => {
        const c = courses.find((x) => x.id === i.courseId);
        return {
          description: c?.titleEs ?? i.courseId,
          qty: i.qty,
          unitPriceMxn: i.priceMxn,
        };
      }),
      subtotalMxn: invoice.subtotalMxn,
      taxMxn: invoice.taxMxn,
      totalMxn: invoice.totalMxn,
      paidAt: payment.paidAt,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.number}.pdf"`);
    stream.pipe(res);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/simulate-webhook')
  simulate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SimulateWebhookDto,
    @Req() req: any,
  ) {
    const user = req.user as RequestUser;
    if (user.role !== Role.PRINCIPAL_ADMIN) {
      throw new ForbiddenException('Admin only');
    }
    return this.svc.simulateWebhook(id, dto.status);
  }
}

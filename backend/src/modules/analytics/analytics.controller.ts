import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AnalyticsService, RequestUser } from './analytics.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(',')),
  ].join('\n');
}

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.PRINCIPAL_ADMIN, Role.CLIENT, Role.CLIENT_ADMIN, Role.SUBCONTRACTOR)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('overview')
  overview(@Req() req: any) {
    return this.svc.overview(req.user as RequestUser);
  }

  @Get('courses')
  courses(@Req() req: any) {
    return this.svc.courses(req.user as RequestUser);
  }

  @Get('learners')
  learners(@Req() req: any) {
    return this.svc.learners(req.user as RequestUser);
  }

  @Get('overview.csv')
  async overviewCsv(@Req() req: any, @Res() res: Response) {
    const data = await this.svc.overview(req.user as RequestUser);
    // Flatten to rows of metric/value pairs.
    const flat: Array<Record<string, unknown>> = [];
    const walk = (prefix: string, obj: any) => {
      if (obj == null || typeof obj !== 'object') {
        flat.push({ metric: prefix, value: obj });
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((v, i) => walk(`${prefix}[${i}]`, v));
        return;
      }
      for (const k of Object.keys(obj)) {
        walk(prefix ? `${prefix}.${k}` : k, obj[k]);
      }
    };
    walk('', data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="overview-analytics.csv"');
    res.send(toCsv(flat));
  }

  @Get('courses.csv')
  async coursesCsv(@Req() req: any, @Res() res: Response) {
    const rows = await this.svc.courses(req.user as RequestUser);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="courses-analytics.csv"');
    res.send(toCsv(rows as any));
  }

  @Get('learners.csv')
  async learnersCsv(@Req() req: any, @Res() res: Response) {
    const rows = await this.svc.learners(req.user as RequestUser);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="learners-analytics.csv"');
    res.send(toCsv(rows as any));
  }

  @Get('report.pdf')
  async reportPdf(@Req() req: any, @Res() res: Response) {
    const user = req.user as RequestUser;
    const [overview, courses, learners] = await Promise.all([
      this.svc.overview(user),
      this.svc.courses(user),
      this.svc.learners(user),
    ]);
    const scopeLabel = user.role === Role.PRINCIPAL_ADMIN
      ? 'Ámbito: toda la plataforma'
      : 'Ámbito: mi empresa + subcontratistas';
    const { renderAnalyticsPdf } = await import('./pdf');
    const stream = renderAnalyticsPdf({ overview, courses, learners, scopeLabel });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="procheeck-report.pdf"');
    stream.pipe(res);
  }
}

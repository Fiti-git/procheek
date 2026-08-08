import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService, RequestUser } from './sales.service';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { Role } from '../../common/roles';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
import { PreviewCommissionDto } from './dto/preview-commission.dto';

@ApiTags('sales')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly svc: SalesService) {}

  // ============================================================
  // Leads
  // ============================================================
  @ApiOperation({ summary: 'List sales leads (scoped by role)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Get('leads')
  listLeads(@Req() req: any) {
    return this.svc.listLeads(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Create a sales lead' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Post('leads')
  createLead(@Body() dto: CreateLeadDto, @Req() req: any) {
    return this.svc.createLead(dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Update lead status or notes' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Patch('leads/:id')
  updateLead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateLeadDto,
    @Req() req: any,
  ) {
    return this.svc.updateLead(id, dto, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Delete a lead' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Delete('leads/:id')
  deleteLead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.deleteLead(id, req.user as RequestUser);
  }

  // ============================================================
  // Deals
  // ============================================================
  @ApiOperation({ summary: 'List deals' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Get('deals')
  listDeals(@Req() req: any) {
    return this.svc.listDeals(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Create a deal (auto-calculates commission)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Post('deals')
  createDeal(@Body() dto: CreateDealDto, @Req() req: any) {
    return this.svc.createDeal(dto, req.user as RequestUser);
  }

  // ============================================================
  // Commissions
  // ============================================================
  @ApiOperation({ summary: 'List commissions (ledger)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Get('commissions')
  listCommissions(
    @Req() req: any,
    @Query('vendedor_id') vendedorId?: string,
    @Query('period_month') periodMonth?: string,
  ) {
    return this.svc.listCommissions(req.user as RequestUser, { vendedorId, periodMonth });
  }

  @ApiOperation({ summary: 'Preview commission for a given rule and amount' })
  @Post('commissions/preview')
  previewCommission(@Body() dto: PreviewCommissionDto) {
    return this.svc.previewCommission(dto.rule, dto.amount, dto.package);
  }

  @ApiOperation({ summary: 'Update commission status (admin only)' })
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch('commissions/:id')
  updateCommission(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCommissionDto,
    @Req() req: any,
  ) {
    return this.svc.updateCommission(id, dto, req.user as RequestUser);
  }

  // ============================================================
  // Vendor profile
  // ============================================================
  @ApiOperation({ summary: "Get current vendedor's profile" })
  @Roles(Role.VENDEDOR, Role.PRINCIPAL_ADMIN)
  @Get('vendor-profile/me')
  myProfile(@Req() req: any) {
    return this.svc.getMyVendorProfile(req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Get vendor profile by user id (admin)' })
  @Roles(Role.PRINCIPAL_ADMIN, Role.VENDEDOR)
  @Get('vendor-profile/:userId')
  getProfile(@Param('userId', new ParseUUIDPipe()) userId: string, @Req() req: any) {
    return this.svc.getVendorProfile(userId, req.user as RequestUser);
  }

  @ApiOperation({ summary: 'Update vendor profile (admin only)' })
  @Roles(Role.PRINCIPAL_ADMIN)
  @Patch('vendor-profile/:userId')
  updateProfile(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() dto: UpdateVendorProfileDto,
    @Req() req: any,
  ) {
    return this.svc.updateVendorProfile(userId, dto, req.user as RequestUser);
  }

  // ============================================================
  // Dashboard
  // ============================================================
  @ApiOperation({ summary: 'Vendedor KPI dashboard summary' })
  @Roles(Role.VENDEDOR, Role.PRINCIPAL_ADMIN)
  @Get('dashboard/summary')
  dashboardSummary(@Req() req: any) {
    return this.svc.dashboardSummary(req.user as RequestUser);
  }
}

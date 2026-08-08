import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength, IsUUID } from 'class-validator';
import { CfdiService, CfdiRequestUser } from './cfdi.service';

class IssueCfdiDto {
  @IsUUID()
  invoice_id!: string;
}

class CancelCfdiDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}

@ApiTags('CFDI')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('cfdi')
export class CfdiController {
  constructor(private readonly svc: CfdiService) {}

  @Post('invoices')
  issue(@Body() dto: IssueCfdiDto, @Req() req: any) {
    return this.svc.issue(dto.invoice_id, req.user as CfdiRequestUser);
  }

  @Post('invoices/:id/cancel')
  cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CancelCfdiDto,
    @Req() req: any,
  ) {
    return this.svc.cancel(id, dto.reason, req.user as CfdiRequestUser);
  }

  @Get('invoices/:id')
  status(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.getStatus(id, req.user as CfdiRequestUser);
  }
}

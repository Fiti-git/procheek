import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorProfile } from './entities/vendor-profile.entity';
import { SalesLead } from './entities/sales-lead.entity';
import { SalesDeal } from './entities/sales-deal.entity';
import { Commission } from './entities/commission.entity';
import { User } from '../users/user.entity';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VendorProfile, SalesLead, SalesDeal, Commission, User])],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}

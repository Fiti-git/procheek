import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from '../payments/invoice.entity';
import { Payment } from '../payments/payment.entity';
import { CfdiController } from './cfdi.controller';
import { CfdiService } from './cfdi.service';
import { StubCfdiProvider } from './providers/stub.provider';
import { CFDI_PROVIDER_TOKEN, CfdiProvider } from './providers/cfdi-provider.interface';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Invoice, Payment]),
  ],
  controllers: [CfdiController],
  providers: [
    CfdiService,
    StubCfdiProvider,
    {
      provide: CFDI_PROVIDER_TOKEN,
      inject: [ConfigService, StubCfdiProvider],
      useFactory: (config: ConfigService, stub: StubCfdiProvider): CfdiProvider => {
        const kind = (config.get<string>('CFDI_PROVIDER') || 'stub').toLowerCase();
        switch (kind) {
          case 'stub':
          default:
            return stub;
        }
      },
    },
  ],
  exports: [CfdiService],
})
export class CfdiModule {}

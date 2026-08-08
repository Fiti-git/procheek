import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CfdiCancelResult,
  CfdiIssueInput,
  CfdiIssueResult,
  CfdiProvider,
  CfdiStatusResult,
} from './cfdi-provider.interface';

@Injectable()
export class StubCfdiProvider implements CfdiProvider {
  name = 'stub';

  async issueInvoice(_input: CfdiIssueInput): Promise<CfdiIssueResult> {
    const uuid = randomUUID();
    return {
      uuid,
      xmlUrl: `https://stub-cfdi/${uuid}.xml`,
      status: 'STAMPED',
      stampedAt: new Date(),
    };
  }

  async cancelInvoice(uuid: string, reason: string): Promise<CfdiCancelResult> {
    return {
      uuid,
      status: 'CANCELED',
      canceledAt: new Date(),
      reason,
    };
  }

  async getInvoice(uuid: string): Promise<CfdiStatusResult> {
    return {
      uuid,
      status: 'STAMPED',
      xmlUrl: `https://stub-cfdi/${uuid}.xml`,
      stampedAt: new Date(),
      canceledAt: null,
      reason: null,
    };
  }
}

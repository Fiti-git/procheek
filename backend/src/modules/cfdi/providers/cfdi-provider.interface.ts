export interface CfdiIssueInput {
  invoiceId: string;
  number: string;
  totalMxn: number;
  subtotalMxn: number;
  taxMxn: number;
  currency: string;
  buyerEmail?: string | null;
  buyerName?: string | null;
}

export interface CfdiIssueResult {
  uuid: string;
  xmlUrl: string;
  status: 'STAMPED' | 'PENDING' | 'FAILED';
  stampedAt: Date;
}

export interface CfdiCancelResult {
  uuid: string;
  status: 'CANCELED' | 'PENDING' | 'FAILED';
  canceledAt: Date;
  reason: string;
}

export interface CfdiStatusResult {
  uuid: string | null;
  status: string | null;
  xmlUrl: string | null;
  stampedAt: Date | null;
  canceledAt: Date | null;
  reason: string | null;
}

export interface CfdiProvider {
  name: string;
  issueInvoice(input: CfdiIssueInput): Promise<CfdiIssueResult>;
  cancelInvoice(uuid: string, reason: string): Promise<CfdiCancelResult>;
  getInvoice(uuid: string): Promise<CfdiStatusResult>;
}

export const CFDI_PROVIDER_TOKEN = 'CFDI_PROVIDER_TOKEN';

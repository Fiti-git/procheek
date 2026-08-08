import { CfdiService } from './cfdi.service';
import { Role } from '../../common/roles';

function repo() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    query: jest.fn().mockResolvedValue([{}]),
    create: jest.fn(),
  } as any;
}

function makeProvider(): any {
  return {
    name: 'mock',
    issueInvoice: jest.fn().mockResolvedValue({
      uuid: 'test-uuid',
      xmlUrl: 'test-url',
      status: 'STAMPED',
      stampedAt: new Date('2024-01-01'),
    }),
    cancelInvoice: jest.fn().mockResolvedValue({
      uuid: 'test-uuid',
      status: 'CANCELED',
      canceledAt: new Date('2024-02-01'),
      reason: 'test',
    }),
    getInvoice: jest.fn().mockResolvedValue({
      uuid: 'test-uuid',
      status: 'STAMPED',
      xmlUrl: 'test-url',
      stampedAt: new Date('2024-01-01'),
      canceledAt: null,
      reason: null,
    }),
  };
}

const actor = { userId: 'u-1', email: 'u@x.com', role: Role.PRINCIPAL_ADMIN };

describe('CfdiService', () => {
  it('issue calls provider.issueInvoice and persists cfdi fields', async () => {
    const invoices = repo();
    const payments = repo();
    const provider = makeProvider();
    invoices.findOne.mockResolvedValue({
      id: 'inv-1',
      number: 'PC-1',
      totalMxn: 116,
      subtotalMxn: 100,
      taxMxn: 16,
      paymentId: 'pay-1',
      cfdiUuid: null,
      cfdiXmlUrl: null,
    });
    payments.findOne.mockResolvedValue({ id: 'pay-1', userId: 'u-1' });
    const svc = new CfdiService(invoices, payments, provider);

    const res = await svc.issue('inv-1', actor);
    expect(provider.issueInvoice).toHaveBeenCalledWith(
      expect.objectContaining({ invoiceId: 'inv-1', number: 'PC-1' }),
    );
    expect(invoices.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE invoices'),
      expect.arrayContaining(['test-uuid', 'test-url']),
    );
    expect(res.provider).toBe('mock');
  });

  it('cancel calls provider.cancelInvoice and stores reason', async () => {
    const invoices = repo();
    const payments = repo();
    const provider = makeProvider();
    invoices.findOne.mockResolvedValue({
      id: 'inv-1',
      number: 'PC-1',
      paymentId: 'pay-1',
      cfdiUuid: 'test-uuid',
    });
    payments.findOne.mockResolvedValue({ id: 'pay-1', userId: 'u-1' });
    const svc = new CfdiService(invoices, payments, provider);

    await svc.cancel('inv-1', 'client requested', actor);
    expect(provider.cancelInvoice).toHaveBeenCalledWith('test-uuid', 'client requested');
    expect(invoices.query).toHaveBeenCalledWith(
      expect.stringContaining('cfdi_canceled_at'),
      expect.arrayContaining(['client requested']),
    );
  });

  it('getStatus returns provider name and stamped state', async () => {
    const invoices = repo();
    const payments = repo();
    const provider = makeProvider();
    invoices.findOne.mockResolvedValue({
      id: 'inv-1',
      number: 'PC-1',
      paymentId: 'pay-1',
      cfdiUuid: 'test-uuid',
      cfdiXmlUrl: 'test-url',
    });
    payments.findOne.mockResolvedValue({ id: 'pay-1', userId: 'u-1' });
    invoices.query.mockResolvedValue([{
      stamped_at: new Date('2024-01-01'),
      cfdi_canceled_at: null,
      cfdi_reason: null,
      cfdi_status: 'STAMPED',
    }]);
    const svc = new CfdiService(invoices, payments, provider);

    const res = await svc.getStatus('inv-1', actor);
    expect(res.status).toBe('STAMPED');
    expect(res.cfdiUuid).toBe('test-uuid');
    expect(res.provider).toBe('mock');
  });

  it('provider is chosen via injection token so it is swappable', async () => {
    const invoices = repo();
    const payments = repo();
    const customProvider = {
      name: 'custom-provider',
      issueInvoice: jest.fn().mockResolvedValue({
        uuid: 'custom-uuid',
        xmlUrl: 'custom-url',
        status: 'STAMPED' as const,
        stampedAt: new Date(),
      }),
      cancelInvoice: jest.fn(),
      getInvoice: jest.fn(),
    };
    invoices.findOne.mockResolvedValue({
      id: 'inv-1',
      number: 'PC-1',
      totalMxn: 100,
      subtotalMxn: 100,
      taxMxn: 0,
      paymentId: 'pay-1',
      cfdiUuid: null,
    });
    payments.findOne.mockResolvedValue({ id: 'pay-1', userId: 'u-1' });
    const svc = new CfdiService(invoices, payments, customProvider as any);

    const res = await svc.issue('inv-1', actor);
    expect(customProvider.issueInvoice).toHaveBeenCalled();
    expect(res.provider).toBe('custom-provider');
  });
});

import { BadRequestException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';

function repo() {
  const qb: any = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getRawMany: jest.fn().mockResolvedValue([]),
  };
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn().mockImplementation((v: any) => Promise.resolve({ id: v?.id ?? 'd-new', ...v })),
    create: jest.fn().mockImplementation((v: any) => v),
    insert: jest.fn().mockResolvedValue({}),
    increment: jest.fn().mockResolvedValue({}),
    createQueryBuilder: jest.fn(() => qb),
    _qb: qb,
  } as any;
}

function make() {
  const docs = repo();
  const purchases = repo();
  const downloads = repo();
  const svc = new LibraryService(docs, purchases, downloads);
  return { svc, docs, purchases, downloads };
}

describe('LibraryService', () => {
  it('list applies filters via query builder', async () => {
    const { svc, docs } = make();
    await svc.list({ category: 'nom', industry: 'construction', nom: 'NOM-035', free: true, search: 'ergo', limit: 10, offset: 5 } as any);
    expect(docs._qb.andWhere).toHaveBeenCalled();
    expect(docs._qb.limit).toHaveBeenCalledWith(10);
    expect(docs._qb.offset).toHaveBeenCalledWith(5);
  });

  it('list excludes unpublished by default', async () => {
    const { svc, docs } = make();
    await svc.list({} as any);
    expect(docs._qb.andWhere).toHaveBeenCalledWith('d.is_published = TRUE');
  });

  it('findOne NotFound when missing', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue(null);
    await expect(svc.findOne('x')).rejects.toThrow(NotFoundException);
  });

  it('findOne returns doc', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'x' });
    expect((await svc.findOne('x')).id).toBe('x');
  });

  it('create paid doc without price throws BadRequest', async () => {
    const { svc } = make();
    await expect(
      svc.create({ title: 'T', fileType: 'pdf', fileUrl: 'u', isFree: false } as any, 'u-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('create free doc succeeds', async () => {
    const { svc } = make();
    const res: any = await svc.create({ title: 'T', fileType: 'pdf', fileUrl: 'u', isFree: true } as any, 'u-1');
    expect(res.title).toBe('T');
    expect(res.createdBy).toBe('u-1');
  });

  it('update mutates provided fields', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', title: 'Old', price: null });
    const res: any = await svc.update('d-1', { title: 'New', price: 99 } as any);
    expect(res.title).toBe('New');
    expect(res.price).toBe('99');
  });

  it('remove sets isPublished false', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isPublished: true });
    const res = await svc.remove('d-1');
    expect(res).toEqual({ id: 'd-1', deleted: true });
  });

  it('recordDownload free doc records log + increment', async () => {
    const { svc, docs, downloads } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: true, isPublished: true, fileUrl: 'u' });
    const res = await svc.recordDownload('d-1', 'u-1', { ip: '1.1.1.1' });
    expect(res).toEqual({ file_url: 'u' });
    expect(downloads.insert).toHaveBeenCalled();
    expect(docs.increment).toHaveBeenCalledWith({ id: 'd-1' }, 'downloadCount', 1);
  });

  it('recordDownload paid doc without user throws 402', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: false, isPublished: true });
    await expect(svc.recordDownload('d-1', null, {})).rejects.toThrow(HttpException);
  });

  it('recordDownload paid doc without purchase throws 402', async () => {
    const { svc, docs, purchases } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: false, isPublished: true });
    purchases.findOne.mockResolvedValue(null);
    await expect(svc.recordDownload('d-1', 'u-1', {})).rejects.toThrow(HttpException);
  });

  it('recordDownload unpublished doc NotFound', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: true, isPublished: false });
    await expect(svc.recordDownload('d-1', 'u-1', {})).rejects.toThrow(NotFoundException);
  });

  it('purchase creates a purchase row for paid doc', async () => {
    const { svc, docs, purchases } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: false, isPublished: true, price: '199' });
    purchases.findOne.mockResolvedValue(null);
    const res: any = await svc.purchase('d-1', 'u-1');
    expect(res.userId).toBe('u-1');
    expect(res.amount).toBe('199');
  });

  it('purchase free doc BadRequest', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: true, isPublished: true });
    await expect(svc.purchase('d-1', 'u-1')).rejects.toThrow(BadRequestException);
  });

  it('purchase already purchased is Forbidden (idempotent guard)', async () => {
    const { svc, docs, purchases } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: false, isPublished: true, price: '199' });
    purchases.findOne.mockResolvedValue({ id: 'existing' });
    await expect(svc.purchase('d-1', 'u-1')).rejects.toThrow(ForbiddenException);
  });

  it('purchase unpublished doc NotFound', async () => {
    const { svc, docs } = make();
    docs.findOne.mockResolvedValue({ id: 'd-1', isFree: false, isPublished: false, price: '199' });
    await expect(svc.purchase('d-1', 'u-1')).rejects.toThrow(NotFoundException);
  });
});

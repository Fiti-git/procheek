import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryDocument } from './entities/library-document.entity';
import { LibraryPurchase } from './entities/library-purchase.entity';
import { LibraryDownload } from './entities/library-download.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ListQueryDto } from './dto/list-query.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(LibraryDocument)
    private readonly docsRepo: Repository<LibraryDocument>,
    @InjectRepository(LibraryPurchase)
    private readonly purchasesRepo: Repository<LibraryPurchase>,
    @InjectRepository(LibraryDownload)
    private readonly downloadsRepo: Repository<LibraryDownload>,
  ) {}

  async list(query: ListQueryDto) {
    const qb = this.docsRepo
      .createQueryBuilder('d')
      .orderBy('d.created_at', 'DESC');

    if (!query.includeUnpublished) {
      qb.andWhere('d.is_published = TRUE');
    }
    if (query.category) {
      qb.andWhere('d.category = :c', { c: query.category });
    }
    if (query.industry) {
      qb.andWhere('d.industry = :i', { i: query.industry });
    }
    if (query.nom) {
      qb.andWhere('d.nom_reference ILIKE :nom', { nom: `%${query.nom}%` });
    }
    if (query.free !== undefined) {
      qb.andWhere('d.is_free = :f', { f: query.free });
    }
    if (query.search) {
      qb.andWhere('(d.title ILIKE :s OR d.description ILIKE :s)', {
        s: `%${query.search}%`,
      });
    }
    if (query.limit) qb.limit(query.limit);
    if (query.offset) qb.offset(query.offset);

    return qb.getMany();
  }

  async findOne(id: string) {
    const doc = await this.docsRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Documento no encontrado');
    return doc;
  }

  async create(dto: CreateDocumentDto, userId: string) {
    if (!dto.isFree && (dto.price === undefined || dto.price === null)) {
      throw new BadRequestException('Los documentos de pago requieren un precio.');
    }
    const doc = this.docsRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category ?? 'general',
      fileType: dto.fileType,
      fileUrl: dto.fileUrl,
      fileSizeBytes: dto.fileSizeBytes != null ? String(dto.fileSizeBytes) : null,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      nomReference: dto.nomReference ?? null,
      industry: dto.industry ?? null,
      isFree: dto.isFree ?? true,
      price: dto.price != null ? String(dto.price) : null,
      isPublished: dto.isPublished ?? true,
      createdBy: userId,
    });
    return this.docsRepo.save(doc);
  }

  async update(id: string, dto: UpdateDocumentDto) {
    const doc = await this.findOne(id);
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.description !== undefined) doc.description = dto.description ?? null;
    if (dto.category !== undefined) doc.category = dto.category;
    if (dto.fileType !== undefined) doc.fileType = dto.fileType;
    if (dto.fileUrl !== undefined) doc.fileUrl = dto.fileUrl;
    if (dto.fileSizeBytes !== undefined)
      doc.fileSizeBytes = dto.fileSizeBytes != null ? String(dto.fileSizeBytes) : null;
    if (dto.thumbnailUrl !== undefined) doc.thumbnailUrl = dto.thumbnailUrl ?? null;
    if (dto.nomReference !== undefined) doc.nomReference = dto.nomReference ?? null;
    if (dto.industry !== undefined) doc.industry = dto.industry ?? null;
    if (dto.isFree !== undefined) doc.isFree = dto.isFree;
    if (dto.price !== undefined) doc.price = dto.price != null ? String(dto.price) : null;
    if (dto.isPublished !== undefined) doc.isPublished = dto.isPublished;
    return this.docsRepo.save(doc);
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    doc.isPublished = false;
    await this.docsRepo.save(doc);
    return { id, deleted: true as const };
  }

  async recordDownload(
    id: string,
    userId: string | null,
    meta: { ip?: string; userAgent?: string },
  ) {
    const doc = await this.findOne(id);
    if (!doc.isPublished) throw new NotFoundException('Documento no disponible');

    if (!doc.isFree) {
      if (!userId) {
        throw new HttpException(
          'Este documento requiere compra previa.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
      const purchase = await this.purchasesRepo.findOne({
        where: { userId, documentId: id },
      });
      if (!purchase) {
        throw new HttpException(
          'Este documento requiere compra previa.',
          HttpStatus.PAYMENT_REQUIRED,
        );
      }
    }

    await this.downloadsRepo.insert({
      documentId: id,
      userId,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    });
    await this.docsRepo.increment({ id }, 'downloadCount', 1);
    return { file_url: doc.fileUrl };
  }

  async purchase(id: string, userId: string) {
    const doc = await this.findOne(id);
    if (doc.isFree) {
      throw new BadRequestException('Este documento es gratuito.');
    }
    if (!doc.isPublished) {
      throw new NotFoundException('Documento no disponible');
    }
    const existing = await this.purchasesRepo.findOne({
      where: { userId, documentId: id },
    });
    if (existing) {
      throw new ForbiddenException('Ya has comprado este documento.');
    }
    const purchase = this.purchasesRepo.create({
      userId,
      documentId: id,
      amount: doc.price ?? '0',
      paymentId: null,
    });
    return this.purchasesRepo.save(purchase);
  }

  async myPurchases(userId: string) {
    const rows = await this.purchasesRepo
      .createQueryBuilder('p')
      .innerJoin(LibraryDocument, 'd', 'd.id = p.document_id')
      .where('p.user_id = :uid', { uid: userId })
      .select([
        'p.id AS id',
        'p.document_id AS document_id',
        'p.amount AS amount',
        'p.purchased_at AS purchased_at',
        'd.title AS title',
        'd.thumbnail_url AS thumbnail_url',
        'd.file_type AS file_type',
      ])
      .orderBy('p.purchased_at', 'DESC')
      .getRawMany();
    return rows;
  }

  async stats() {
    const [{ count: totalDocs }] = await this.docsRepo.query(
      'SELECT COUNT(*)::int AS count FROM library_documents',
    );
    const [{ count: totalDownloads }] = await this.docsRepo.query(
      'SELECT COUNT(*)::int AS count FROM library_downloads',
    );
    const [{ count: totalPurchases }] = await this.docsRepo.query(
      'SELECT COUNT(*)::int AS count FROM library_purchases',
    );
    const [{ total: revenueTotal }] = await this.docsRepo.query(
      'SELECT COALESCE(SUM(amount),0)::numeric AS total FROM library_purchases',
    );
    return {
      total_documents: Number(totalDocs) || 0,
      total_downloads: Number(totalDownloads) || 0,
      total_purchases: Number(totalPurchases) || 0,
      revenue_total: Number(revenueTotal) || 0,
    };
  }
}

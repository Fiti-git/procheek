import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { promises as fsp } from 'fs';
import { extname, join } from 'path';
import { Upload } from './upload.entity';

const ALLOWED = new Set<string>([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
]);

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

@Injectable()
export class UploadsService {
  private readonly dir = join(process.cwd(), 'uploads');

  constructor(@InjectRepository(Upload) private readonly repo: Repository<Upload>) {
    if (!existsSync(this.dir)) mkdirSync(this.dir, { recursive: true });
  }

  async save(file: Express.Multer.File, uploaderId: string): Promise<Upload> {
    if (!file) throw new BadRequestException('No file');
    if (file.size > MAX_BYTES) throw new BadRequestException('File too large');
    if (!ALLOWED.has(file.mimetype)) {
      throw new BadRequestException(`Unsupported type: ${file.mimetype}`);
    }
    const id = randomUUID();
    const ext = extname(file.originalname) || '';
    const storageName = `${id}${ext.toLowerCase()}`;
    const dest = join(this.dir, storageName);
    await fsp.writeFile(dest, file.buffer);

    return this.repo.save(this.repo.create({
      id,
      storagePath: storageName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedBy: uploaderId,
    }));
  }

  async findById(id: string): Promise<Upload> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Upload not found');
    return u;
  }

  absolutePath(u: Upload) {
    return join(this.dir, u.storagePath);
  }
}

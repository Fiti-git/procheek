import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  @Get()
  async check() {
    let db: 'up' | 'down' = 'down';
    let dbError: string | undefined;
    try {
      await this.ds.query('SELECT 1');
      db = 'up';
    } catch (err: any) {
      dbError = err?.message ?? 'unknown';
    }
    return {
      status: db === 'up' ? 'ok' : 'degraded',
      service: 'procheeck-api',
      db,
      dbError,
      time: new Date().toISOString(),
    };
  }
}

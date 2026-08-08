import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationKind } from './notification.entity';

export interface CreateNotification {
  userId: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  link?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly repo: Repository<Notification>,
  ) {}

  create(n: CreateNotification) {
    return this.repo.save(this.repo.create({
      userId: n.userId,
      kind: n.kind,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
    }));
  }

  listMine(userId: string, opts: { unreadOnly?: boolean } = {}) {
    const qb = this.repo.createQueryBuilder('n')
      .where('n.user_id = :uid', { uid: userId })
      .orderBy('n.created_at', 'DESC')
      .limit(100);
    if (opts.unreadOnly) qb.andWhere('n.read_at IS NULL');
    return qb.getMany();
  }

  async countUnread(userId: string) {
    const [{ count }] = await this.repo.query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId],
    );
    return count as number;
  }

  async markRead(id: string, userId: string) {
    const n = await this.repo.findOne({ where: { id } });
    if (!n) throw new NotFoundException('Notification not found');
    if (n.userId !== userId) throw new ForbiddenException('Not your notification');
    if (!n.readAt) {
      n.readAt = new Date();
      await this.repo.save(n);
    }
    return n;
  }

  async markAllRead(userId: string) {
    const res = await this.repo.query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [userId],
    );
    return { ok: true, affected: res?.[1] ?? 0 };
  }
}

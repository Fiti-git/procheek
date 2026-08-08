import { Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  list(@Req() req: any, @Query('unread') unread?: string) {
    return this.svc.listMine(req.user.userId, { unreadOnly: unread === 'true' });
  }

  @Get('unread-count')
  async unreadCount(@Req() req: any) {
    return { count: await this.svc.countUnread(req.user.userId) };
  }

  @Post(':id/read')
  markRead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.markRead(id, req.user.userId);
  }

  @Patch(':id/read')
  patchMarkRead(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: any) {
    return this.svc.markRead(id, req.user.userId);
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.userId);
  }

  @Patch('read-all')
  patchMarkAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.userId);
  }
}

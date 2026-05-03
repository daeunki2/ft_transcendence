import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PresenceService } from './presence.service';
import type { PresenceRawEvent } from './presence.types';

@Controller('internal/presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(':userId')
  async getPresence(@Param('userId') userId: string) {
    return this.presenceService.getPresence(userId);
  }

  @Post('events')
  async publishEvent(@Body() event: PresenceRawEvent) {
    await this.presenceService.publishRawEvent(event);
    return { success: true };
  }
}

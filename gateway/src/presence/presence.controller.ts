import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
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
  async publishEvent(
    @Headers('x-internal-token') internalToken: string | undefined,
    @Body() event: PresenceRawEvent,
  ) {
    const expectedToken = process.env.PRESENCE_INTERNAL_TOKEN?.trim() || 'dev-presence-token';
    if (!expectedToken || internalToken !== expectedToken) {
      throw new UnauthorizedException('INTERNAL_UNAUTHORIZED');
    }
    await this.presenceService.publishRawEvent(event);
    return { success: true };
  }
}

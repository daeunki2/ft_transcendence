import {
  BadRequestException,
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

type InvalidateFriendCacheBody = {
  userIds?: unknown;
};

@Controller('internal/presence')
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get(':userId')
  async getPresence(
    @Param('userId') userId: string,
    @Headers('x-internal-token') internalToken: string | undefined,
  ) {
    const expectedToken = process.env.PRESENCE_INTERNAL_TOKEN?.trim();
    if (!expectedToken || internalToken !== expectedToken) {
      throw new UnauthorizedException('INTERNAL_UNAUTHORIZED');
    }
    return this.presenceService.getPresence(userId);
  }

  @Post('events')
  async publishEvent(
    @Headers('x-internal-token') internalToken: string | undefined,
    @Body() event: PresenceRawEvent,
  ) {
    const expectedToken = process.env.PRESENCE_INTERNAL_TOKEN?.trim();
    if (!expectedToken || internalToken !== expectedToken) {
      throw new UnauthorizedException('INTERNAL_UNAUTHORIZED');
    }
    await this.presenceService.publishRawEvent(event);
    return { success: true };
  }

  @Post('friends-cache/invalidate')
  async invalidateFriendCache(
    @Headers('x-internal-token') internalToken: string | undefined,
    @Body() body: InvalidateFriendCacheBody,
  ) {
    const expectedToken = process.env.PRESENCE_INTERNAL_TOKEN?.trim();
    if (!expectedToken || internalToken !== expectedToken) {
      throw new UnauthorizedException('INTERNAL_UNAUTHORIZED');
    }

    if (!Array.isArray(body.userIds)) {
      throw new BadRequestException('USER_IDS_REQUIRED');
    }

    const userIds = body.userIds.filter(
      (id): id is string => typeof id === 'string' && id.trim().length > 0,
    );
    if (userIds.length === 0) {
      throw new BadRequestException('USER_IDS_REQUIRED');
    }

    await this.presenceService.invalidateFriendCaches(userIds);
    return { success: true };
  }
}

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  PRESENCE_RAW_CHANNEL,
  PRESENCE_UPDATED_CHANNEL,
  PresenceRawEvent,
  PresenceState,
  PresenceUpdatedEvent,
  PublicPresenceState,
} from './presence.types';
import { PresenceRedis } from './presence.redis';

@Injectable()
export class PresenceService {
  constructor(private readonly redis: PresenceRedis) {}

  async publishRawEvent(event: PresenceRawEvent): Promise<void> {
    await this.redis.getPublisher().publish(PRESENCE_RAW_CHANNEL, JSON.stringify(event));
  }

  async publishGatewayConnectionEvent(
    userId: string,
    type: 'connected' | 'disconnected',
  ): Promise<void> {
    // gateway source 이벤트는 user별 단조 증가 seq로 발행하여 순서 보장을 강화
    const seq = await this.redis.getPublisher().incr(`presence:seq:gateway:${userId}`);
    const event: PresenceRawEvent = {
      eventId: randomUUID(),
      userId,
      type,
      source: 'gateway',
      seq,
      at: new Date().toISOString(),
      version: 1,
    };
    await this.publishRawEvent(event);
  }

  async startRawEventConsumer(): Promise<void> {
    const sub = this.redis.getSubscriber();
    await sub.subscribe(PRESENCE_RAW_CHANNEL);
    sub.on('message', async (channel, payload) => {
      if (channel !== PRESENCE_RAW_CHANNEL) return;
      const event = this.parseEvent(payload);
      if (!event) return;
      await this.handleRawEvent(event);
    });
    console.log('[presence] subscribed channel:', PRESENCE_RAW_CHANNEL);
  }

  async getPresence(userId: string) {
    const internalStatus = await this.redis.getEffectiveState(userId);
    const connCount = await this.redis.getConnectionCount(userId);
    const flags = await this.redis.getFlags(userId);
    return {
      userId,
      connCount,
      flags,
      internalStatus,
      publicStatus: this.toPublicStatus(internalStatus),
    };
  }

  private async handleRawEvent(event: PresenceRawEvent): Promise<void> {
    // 흐름 제어: fallback/retry로 같은 이벤트가 들어오면 eventId 기준으로 1회만 처리
    const firstSeen = await this.redis.markEventProcessed(event.eventId);
    if (!firstSeen) {
      return;
    }

    // 흐름 제어: 오래된 이벤트는 버리고 최신 이벤트만 상태 계산에 반영
    if (!(await this.isEventFresh(event))) {
      return;
    }

    const prevStatus = await this.redis.getEffectiveState(event.userId);
    await this.applyEventToStorage(event);
    const nextStatus = await this.recomputeEffectiveStatus(event.userId);
    await Promise.all([
      this.redis.setLastSequence(event.userId, event.seq),
      this.redis.setLastEventAt(event.userId, event.at),
      // 실제 기록: 계산된 최종 상태를 Redis에 저장
      this.redis.setEffectiveState(event.userId, nextStatus),
    ]);
    if (prevStatus === nextStatus) return;
    const updatedEvent: PresenceUpdatedEvent = {
      userId: event.userId,
      internalStatus: nextStatus,
      publicStatus: this.toPublicStatus(nextStatus),
      at: new Date().toISOString(),
      version: 1,
    };
    await this.redis
      .getPublisher()
      .publish(PRESENCE_UPDATED_CHANNEL, JSON.stringify(updatedEvent));
  }

  private async applyEventToStorage(event: PresenceRawEvent): Promise<void> {
    const flags = await this.redis.getFlags(event.userId);
    switch (event.type) {
      case 'connected':
        await this.redis.incrementConnection(event.userId);
        return;
      case 'disconnected':
        await this.redis.decrementConnection(event.userId);
        return;
      case 'matching_started':
        flags.matching = true;
        await this.redis.setFlags(event.userId, flags);
        return;
      case 'matching_ended':
        flags.matching = false;
        await this.redis.setFlags(event.userId, flags);
        return;
      case 'game_started':
        flags.inGame = true;
        flags.matching = false;
        await this.redis.setFlags(event.userId, flags);
        return;
      case 'game_ended':
        flags.inGame = false;
        await this.redis.setFlags(event.userId, flags);
        return;
      default:
        return;
    }
  }

  private async recomputeEffectiveStatus(userId: string): Promise<PresenceState> {
    const connCount = await this.redis.getConnectionCount(userId);
    const flags = await this.redis.getFlags(userId);
    if (flags.inGame) return 'IN_GAME';
    if (flags.matching) return 'MATCHING';
    if (connCount > 0) return 'ONLINE';
    return 'OFFLINE';
  }

  private toPublicStatus(state: PresenceState): PublicPresenceState {
    if (state === 'IN_GAME') return 'IN_GAME';
    if (state === 'OFFLINE') return 'OFFLINE';
    return 'ONLINE';
  }

  private parseEvent(payload: string): PresenceRawEvent | null {
    try {
      const parsed = JSON.parse(payload) as PresenceRawEvent;
      if (
        !parsed?.userId ||
        !parsed?.eventId ||
        !parsed?.type ||
        !parsed?.source ||
        !parsed?.at ||
        typeof parsed.seq !== 'number'
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private async isEventFresh(event: PresenceRawEvent): Promise<boolean> {
    const [lastSeq, lastAtMs] = await Promise.all([
      this.redis.getLastSequence(event.userId),
      this.redis.getLastEventAt(event.userId),
    ]);
    if (event.seq < lastSeq) return false;
    if (event.seq > lastSeq) return true;
    const eventAtMs = Date.parse(event.at);
    if (Number.isNaN(eventAtMs)) return false;
    return eventAtMs >= lastAtMs;
  }
}

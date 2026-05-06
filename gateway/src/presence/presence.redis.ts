import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PresenceState } from './presence.types';

type PresenceFlags = {
  matching: boolean;
  inGame: boolean;
};

@Injectable()
export class PresenceRedis implements OnModuleDestroy {
  private readonly host: string;
  private readonly port: number;
  private readonly pub: Redis;
  private readonly sub: Redis;
  private readonly kv: Redis;

  constructor(private readonly configService: ConfigService) {
    this.host = this.configService.get<string>('REDIS_HOST') ?? 'redis';
    this.port = Number(this.configService.get<string>('REDIS_PORT') ?? 6379);
    this.pub = new Redis({ host: this.host, port: this.port });
    this.sub = new Redis({ host: this.host, port: this.port });
    this.kv = new Redis({ host: this.host, port: this.port });
  }

  getPublisher() {
    return this.pub;
  }

  getSubscriber() {
    return this.sub;
  }

  createSubscriber() {
    return new Redis({ host: this.host, port: this.port });
  }

  async getConnectionCount(userId: string): Promise<number> {
    const raw = await this.kv.get(this.connKey(userId));
    return Number(raw ?? 0);
  }

  async incrementConnection(userId: string): Promise<number> {
    return this.kv.incr(this.connKey(userId));
  }

  async decrementConnection(userId: string): Promise<number> {
    const key = this.connKey(userId);
    const count = await this.kv.decr(key);
    if (count <= 0) {
      await this.kv.set(key, '0');
      return 0;
    }
    return count;
  }

  async getEffectiveState(userId: string): Promise<PresenceState> {
    const raw = await this.kv.get(this.effectiveKey(userId));
    if (raw === 'ONLINE' || raw === 'MATCHING' || raw === 'IN_GAME') {
      return raw;
    }
    return 'OFFLINE';
  }

  async setEffectiveState(userId: string, state: PresenceState): Promise<void> {
    await Promise.all([
      this.kv.set(this.effectiveKey(userId), state),
      this.kv.set(this.lastSeenKey(userId), new Date().toISOString()),
    ]);
  }

  async getFlags(userId: string): Promise<PresenceFlags> {
    const raw = await this.kv.get(this.flagsKey(userId));
    if (!raw) return { matching: false, inGame: false };
    try {
      const parsed = JSON.parse(raw) as PresenceFlags;
      return {
        matching: Boolean(parsed.matching),
        inGame: Boolean(parsed.inGame),
      };
    } catch {
      return { matching: false, inGame: false };
    }
  }

  async setFlags(userId: string, flags: PresenceFlags): Promise<void> {
    await this.kv.set(this.flagsKey(userId), JSON.stringify(flags));
  }

  async getLastSequence(userId: string): Promise<number> {
    const raw = await this.kv.get(this.lastSeqKey(userId));
    return Number(raw ?? 0);
  }

  async setLastSequence(userId: string, seq: number): Promise<void> {
    await this.kv.set(this.lastSeqKey(userId), String(seq));
  }

  async getLastEventAt(userId: string): Promise<number> {
    const raw = await this.kv.get(this.lastEventAtKey(userId));
    if (!raw) return 0;
    const time = Date.parse(raw);
    return Number.isNaN(time) ? 0 : time;
  }

  async setLastEventAt(userId: string, at: string): Promise<void> {
    await this.kv.set(this.lastEventAtKey(userId), at);
  }

  async markEventProcessed(eventId: string, ttlSec = 120): Promise<boolean> {
    const result = await this.kv.set(this.eventDedupKey(eventId), '1', 'EX', ttlSec, 'NX');
    return result === 'OK';
  }

  async getFriendIdsCache(userId: string): Promise<string[] | null> {
    const raw = await this.kv.get(this.friendIdsKey(userId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as string[];
      if (!Array.isArray(parsed)) return null;
      return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
    } catch {
      return null;
    }
  }

  async setFriendIdsCache(userId: string, friendIds: string[], ttlSec = 15): Promise<void> {
    await this.kv.set(this.friendIdsKey(userId), JSON.stringify(friendIds), 'EX', ttlSec);
  }

  async onModuleDestroy() {
    await Promise.all([this.pub.quit(), this.sub.quit(), this.kv.quit()]);
  }

  private connKey(userId: string) {
    return `presence:conn:${userId}`;
  }

  private effectiveKey(userId: string) {
    return `presence:effective:${userId}`;
  }

  private flagsKey(userId: string) {
    return `presence:flags:${userId}`;
  }

  private lastSeqKey(userId: string) {
    return `presence:lastSeq:${userId}`;
  }

  private lastEventAtKey(userId: string) {
    return `presence:lastEventAt:${userId}`;
  }

  private eventDedupKey(eventId: string) {
    return `presence:event:${eventId}`;
  }

  private lastSeenKey(userId: string) {
    return `presence:lastSeen:${userId}`;
  }

  private friendIdsKey(userId: string) {
    return `presence:friends:${userId}`;
  }
}

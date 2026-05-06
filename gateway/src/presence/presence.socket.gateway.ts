import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { PRESENCE_UPDATED_CHANNEL, type PresenceUpdatedEvent } from './presence.types';
import { PresenceRedis } from './presence.redis';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class PresenceSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly socketUserMap = new Map<string, string>();

  constructor(
    private readonly presenceService: PresenceService,
    private readonly presenceRedis: PresenceRedis,
  ) {
    void this.subscribePresenceUpdates();
  }

  async handleConnection(client: Socket) {
    const token = this.extractAccessToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }
    try {
      const payload = jwt.verify(token, process.env.MY_SECRET_KEY ?? '') as { sub?: string };
      const userId = String(payload?.sub ?? '');
      if (!userId) {
        client.disconnect(true);
        return;
      }
      this.socketUserMap.set(client.id, userId);
      client.join(`user:${userId}`);
      // 이벤트 발생: 실제 WS 연결 생성 시 connected 발행
      await this.presenceService.publishGatewayConnectionEvent(userId, 'connected');
    } catch {
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    this.socketUserMap.delete(client.id);
    // 이벤트 발생: 실제 WS 연결 해제 시 disconnected 발행
    await this.presenceService.publishGatewayConnectionEvent(userId, 'disconnected');
  }

  private extractAccessToken(client: Socket): string | null {
    const header = client.handshake.headers.cookie;
    if (!header) return null;
    const token = header
      .split(';')
      .map((v) => v.trim())
      .find((v) => v.startsWith('accessToken='))
      ?.slice('accessToken='.length);
    return token ?? null;
  }

  private async subscribePresenceUpdates() {
    const sub = this.presenceRedis.createSubscriber();
    await sub.subscribe(PRESENCE_UPDATED_CHANNEL);
    sub.on('message', async (channel, payload) => {
      if (channel !== PRESENCE_UPDATED_CHANNEL) return;
      try {
        const event = JSON.parse(payload) as PresenceUpdatedEvent;
        if (!this.server) return;
        // 2차 범위 축소: 본인 + 친구 룸에만 전파 (실패 시 본인만)
        const targets = new Set<string>([`user:${event.userId}`]);
        const friendIds = await this.fetchFriendIds(event.userId);
        for (const friendId of friendIds) {
          targets.add(`user:${friendId}`);
        }
        for (const room of targets) {
          this.server.to(room).emit('presence.updated', event);
        }
      } catch {
        // invalid payload ignore
      }
    });
  }

  private async fetchFriendIds(userId: string): Promise<string[]> {
    const cached = await this.presenceRedis.getFriendIdsCache(userId);
    if (cached) {
      return cached;
    }

    const internalToken = process.env.PRESENCE_INTERNAL_TOKEN?.trim() || 'dev-presence-token';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 700);
    try {
      const response = await fetch(`http://user-service:4001/friends/internal/${userId}/ids`, {
        method: 'GET',
        headers: {
          'x-internal-token': internalToken,
        },
        signal: controller.signal,
      });
      if (!response.ok) return [];
      const body = (await response.json()) as { friendIds?: string[] };
      if (!Array.isArray(body.friendIds)) return [];
      const friendIds = body.friendIds.filter(
        (id): id is string => typeof id === 'string' && id.length > 0,
      );
      await this.presenceRedis.setFriendIdsCache(userId, friendIds, 15);
      return friendIds;
    } catch {
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

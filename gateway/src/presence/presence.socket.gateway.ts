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

// suna : game-service 와 합의된 친구 초대 wakeup 채널.
// game-service/src/engine/game-engine.constants.ts 의 GAME_INVITE_WAKEUP_CHANNEL 과 동일해야 한다.
const GAME_INVITE_WAKEUP_CHANNEL = 'game.invite.wakeup';
type GameInviteWakeupPayload = {
  targetUserId: string;
  inviterUserId: string;
  inviterNickname: string;
  at: string;
};

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
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
    // suna : game-service 의 친구 초대 신호를 받아 target 의 presence 룸으로 forward.
    void this.subscribeGameInviteWakeup();
  }

  async handleConnection(client: Socket) {
    const token = this.extractAccessToken(client);
    if (!token) {
      console.warn('[PresenceWS] 연결 거부: accessToken 없음', { socketId: client.id });
      client.disconnect(true);
      return;
    }
    try {
      const payload = jwt.verify(token, process.env.MY_SECRET_KEY ?? '') as { sub?: string };
      const userId = String(payload?.sub ?? '');
      if (!userId) {
        console.warn('[PresenceWS] 연결 거부: 토큰 sub 없음', { socketId: client.id });
        client.disconnect(true);
        return;
      }
      this.socketUserMap.set(client.id, userId);
      client.join(`user:${userId}`);
      client.on('presence.heartbeat', async () => {
        await this.presenceService.markHeartbeat(userId);
      });
      console.log('[PresenceWS] connected', {
        userId,
        socketId: client.id,
      });
      // 이벤트 발생: 실제 WS 연결 생성 시 connected 발행
      await this.presenceService.publishGatewayConnectionEvent(userId, 'connected');
    } catch {
      console.warn('[PresenceWS] 연결 거부: 토큰 검증 실패', { socketId: client.id });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;
    this.socketUserMap.delete(client.id);
    console.log('[PresenceWS] disconnected', {
      userId,
      socketId: client.id,
    });
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

  // suna : game.invite.wakeup 채널 구독 -> user:{targetUserId} 룸에 'game.invite' 이벤트 emit.
  // payload 는 frontend usePresenceSocket 이 받아 GameContext 의 activateGameSocket 을 트리거한다.
  private async subscribeGameInviteWakeup() {
    const sub = this.presenceRedis.createSubscriber();
    await sub.subscribe(GAME_INVITE_WAKEUP_CHANNEL);
    sub.on('message', (channel, payload) => {
      if (channel !== GAME_INVITE_WAKEUP_CHANNEL) return;
      try {
        const event = JSON.parse(payload) as GameInviteWakeupPayload;
        if (!event?.targetUserId || !this.server) return;
        this.server.to(`user:${event.targetUserId}`).emit('game.invite', event);
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 700);
    try {
      const response = await fetch(`http://user-service:4001/friends/internal/${userId}/ids`, {
        method: 'GET',
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

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
    sub.on('message', (channel, payload) => {
      if (channel !== PRESENCE_UPDATED_CHANNEL) return;
      try {
        const event = JSON.parse(payload) as PresenceUpdatedEvent;
        if (!this.server) return;
        // 지금 단계는 단순 브로드캐스트: SocialPage에서 바로 상태 반영 가능
        this.server.emit('presence.updated', event);
      } catch {
        // invalid payload ignore
      }
    });
  }
}

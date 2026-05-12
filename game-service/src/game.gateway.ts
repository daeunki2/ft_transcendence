import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private extractUserId(client: Socket): string | null {
    const headerId = client.handshake.headers['x-user-id'];
    if (typeof headerId === 'string' && headerId.trim() !== '') {
      return headerId;
    }
    const queryId = client.handshake.query.userId;
    if (typeof queryId === 'string' && queryId.trim() !== '') {
      return queryId;
    }
    return null;
  }

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) {
      console.warn(`[Game] 인증 헤더 누락 -> 접속 거부 (socketId=${client.id})`);
      client.disconnect();
      return;
    }
    client.data.userId = userId;
    console.log(`[Game] 연결 성공: userId=${userId}, socketId=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }
    // 이유: Phase 3에서 큐/룸 정리 로직이 여기 들어옴. 지금은 로그만.
    console.log(`[Game] 연결 종료: userId=${userId}, socketId=${client.id}`);
  }

  @SubscribeMessage('join_queue')
  onJoinQueue(client: Socket) {
    const userId = client.data.userId;
    console.log(`[Game] join_queue 수신 (stub): userId=${userId}`);
    // 이유: Phase 3에서 Redis 큐 등록 + 매칭 시도 로직 추가 예정.
    client.emit('queue_error', {
      code: 'NOT_IMPLEMENTED',
      message: '매칭 기능은 아직 구현 중입니다.',
    });
  }

  @SubscribeMessage('leave_queue')
  onLeaveQueue(client: Socket) {
    const userId = client.data.userId;
    console.log(`[Game] leave_queue 수신 (stub): userId=${userId}`);
    // 이유: Phase 3에서 큐 제거 로직 추가 예정.
  }
}

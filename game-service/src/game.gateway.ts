import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { MatchmakingService } from './matchmaking/matchmaking.service';
import { GameRedis } from './redis/game.redis';
import { GameRuntimeService } from './engine/game-runtime.service'; // daeunki2 추가
import {
  GAME_JOIN_QUEUE_EVENT,
  GAME_MOVE_PADDLE_EVENT,
} from './engine/game-engine.constants';
import type { MovePaddlePayload } from './engine/game-engine.types'; //daeunki2추가

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
})



export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // 이유: @WebSocketGateway({ namespace: 'game' }) 사용 시 런타임에 주입되는 인스턴스는
  // 사실 Namespace 다. Server 로 두면 .sockets 가 default Namespace 로 추론돼
  // .sockets.values() / .sockets.get() 같은 Map API 가 보이지 않는다.
  @WebSocketServer() server: Namespace;

  constructor(
    private readonly matchmaking: MatchmakingService,
    private readonly gameRedis: GameRedis,
    private readonly gameRuntime: GameRuntimeService, // daeunki2 추가 : 게임 실행 로직
  ) {}

  // daeunki2 추가 : 패들 움직임
  @SubscribeMessage(GAME_MOVE_PADDLE_EVENT)
  onMovePaddle(client: Socket, payload: MovePaddlePayload) {
    this.gameRuntime.movePaddle(client, payload);
  }

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

  // 이유: gateway가 JWT 검증 시 payload.isGuest=true 인 경우만 x-is-guest='true' 헤더를 박는다.
  // 그 외(헤더 없음)는 모두 회원으로 간주.
  private extractIsGuest(client: Socket): boolean {
    const header = client.handshake.headers['x-is-guest'];
    if (typeof header === 'string') return header === 'true';
    if (Array.isArray(header)) return header.includes('true');
    return false;
  }

  // daeunki2 수정 : 게임 결과 DB 저장 시 winner/loser nickname이 필요해서 소켓 query에서 nickname을 꺼낸다.
  private extractNickname(client: Socket): string {
    const queryNickname = client.handshake.query.nickname;
    if (typeof queryNickname === 'string' && queryNickname.trim() !== '') {
      return queryNickname.trim();
    }
    // daeunki2 수정 : 닉네임이 없는 예외 상황에서는 기록 저장이 깨지지 않도록 userId를 fallback으로 사용한다.
    return String(client.data.userId ?? '');
  }

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) {
      console.warn(`[Game] 인증 헤더 누락 -> 접속 거부 (socketId=${client.id})`);
      client.disconnect();
      return;
    }

    // 이유: 같은 userId 가 이미 다른 소켓(다른 탭/창)으로 연결돼 있으면 기존 소켓을 끊는다.
    // 큐는 userId 단일 키 기준이라 여러 소켓이 동시에 살아 있으면 socketId 덮어쓰기/
    // disconnect LREM 으로 양쪽 모두 매칭 권한을 잃는 케이스가 발생한다.
    // 정책: "유저당 게임 소켓 1개" 강제, 새 연결이 항상 우선.
    this.evictDuplicateSockets(userId, client.id);

    const isGuest = this.extractIsGuest(client);
    client.data.userId = userId;
    client.data.isGuest = isGuest;
    // daeunki2 수정 : Runtime 서비스가 게임 기록 저장에 사용할 nickname을 socket data에 보관한다.
    client.data.nickname = this.extractNickname(client);
    console.log(
      `[Game] 연결 성공: userId=${userId}, isGuest=${isGuest}, socketId=${client.id}`,
    );
  }

  // 이유: namespace 의 모든 소켓을 훑어 동일 userId 인 기존 소켓을 종료한다.
  // 끊긴 소켓은 handleDisconnect 가 자동으로 큐 정리(matchmaking.dequeue)까지 처리한다.
  // message 는 i18n 우회를 막기 위해 영어 fallback 만 두고, 프론트는 code 기준으로 i18n 룩업한다.
  private evictDuplicateSockets(userId: string, incomingSocketId: string): void {
    for (const existing of this.server.sockets.values()) {
      if (existing.id === incomingSocketId) continue;
      if (existing.data?.userId !== userId) continue;
      console.warn(
        `[Game] 동일 userId 중복 연결 감지 → 기존 소켓 강제 종료: userId=${userId} oldSocketId=${existing.id} newSocketId=${incomingSocketId}`,
      );
      existing.emit('queue_error', {
        code: 'KICKED_BY_NEW_TAB',
        message: 'Connection closed because a new session started in another tab.',
      });
      existing.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId: string | undefined = client.data.userId;
    const isGuest: boolean = Boolean(client.data.isGuest);
    if (!userId) return;

    console.log(`[Game] 연결 종료: userId=${userId}, socketId=${client.id}`);

    // 이유: 큐 대기 중 끊긴 경우 큐에서 빼고 matching_ended 발행.
    await this.matchmaking.dequeue(userId, isGuest);

    // 이유: 매칭된 게임 진행 중 끊긴 경우는 다은님 영역(로직 서비스)에서 game_ended 처리.
    // daeunki2 수정 : 실제 게임 중 disconnect는 Runtime 서비스가 기권 처리, game_over, 기록 저장, Redis 정리를 담당한다.
    await this.gameRuntime.handleDisconnect(client, this.server);
  }

  // @SubscribeMessage('join_queue')
  // daeunki2 주석처리 : 이벤트명을 직접 문자열로 쓰면 상수와 불일치할 수 있어 아래 GAME_JOIN_QUEUE_EVENT를 사용한다.
  @SubscribeMessage(GAME_JOIN_QUEUE_EVENT)
  async onJoinQueue(client: Socket) {
    const userId: string | undefined = client.data.userId;
    const isGuest: boolean = Boolean(client.data.isGuest);
    if (!userId) {
      // 이유: message 는 영어 fallback 만 두고, 실제 표시 문구는 프론트가 code 로 i18n 룩업한다.
      client.emit('queue_error', { code: 'UNAUTHENTICATED', message: 'Authentication required.' });
      return;
    }

    // 이유: 이미 진행 중인 게임이 있다면 새 매칭 금지 (중복 매칭 방지).
    const existing = await this.gameRedis.getUserGameId(userId);
    if (existing) {
      client.emit('queue_error', {
        code: 'ALREADY_IN_GAME',
        message: 'You are already in an ongoing game.',
        gameId: existing,
      });
      return;
    }

    console.log(`[Game] join_queue: userId=${userId} isGuest=${isGuest}`);
    // await this.matchmaking.enqueue(userId, client.id, isGuest, this.server); >> 매창까지만 하는 로직
    const match = await this.matchmaking.enqueue(userId, client.id, isGuest, this.server);
    if (match) {
        await this.gameRuntime.startMatch(match, this.server);
    } // daeunki2 :  매칭이 존재하면 게임 시작하게 수정
  }

}

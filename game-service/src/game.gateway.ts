import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Namespace, Socket } from 'socket.io';
import {
  GAME_OVER_EVENT,
  GAME_JOIN_QUEUE_EVENT,
  GAME_MOVE_PADDLE_EVENT,
  GAME_STATE_EVENT,
} from './engine/game-engine.constants';
import type { EngineState, MovePaddlePayload, PlayerSlot } from './engine/game-engine.types';
import { GameEngineService } from './engine/game-engine.service';
import { GameRecordEntity } from './game-record.entity';

type RuntimeGameSession = {
  gameId: string;
  p1SocketId: string;
  p2SocketId: string;
  p1UserId: string;
  p2UserId: string;
  p1Nickname: string;
  p2Nickname: string;
  state: EngineState;
  timer: NodeJS.Timeout;
};


@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  },
}) // 게임 소켓

export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Namespace;
  constructor(
    private readonly engine: GameEngineService,
    @InjectRepository(GameRecordEntity)
    private readonly gameRecordRepository: Repository<GameRecordEntity>,
  ) {}
  private readonly presenceEventsUrl =
    process.env.PRESENCE_EVENTS_URL ?? 'http://gateway:8000/internal/presence/events';

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

  private extractNickname(client: Socket): string {
    const queryNickname = client.handshake.query.nickname;
    if (typeof queryNickname === 'string' && queryNickname.trim() !== '') {
      return queryNickname.trim();
    }
    // daeunki2수정 : 수정이유
    // 닉네임 전달이 누락돼도 기록 저장이 깨지지 않도록 userId를 fallback으로 사용한다.
    return String(client.data.userId ?? '');
  }

  handleConnection(client: Socket) {
    const userId = this.extractUserId(client);
    if (!userId) {
      console.warn(`[Game] 인증 헤더 누락 -> 접속 거부 (socketId=${client.id})`);
      client.disconnect();
      return;
    }
    client.data.userId = userId;
    client.data.nickname = this.extractNickname(client);
    console.log(`[Game] 연결 성공: userId=${userId}, socketId=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }
    // 이유: Phase 3에서 큐/룸 정리 로직이 여기 들어옴. 지금은 로그만.
    console.log(`[Game] 연결 종료: userId=${userId}, socketId=${client.id}`);

    // ===== daeunki2 : 이탈시 세션 종료/정리 =====
    this.handleDisconnectRuntime(client);
  }

  @SubscribeMessage(GAME_JOIN_QUEUE_EVENT)
  onJoinQueue(client: Socket) {
    const userId = client.data.userId;
  //  console.log(`[Game] ${GAME_JOIN_QUEUE_EVENT} 수신 (stub): userId=${userId}`);
    // ===== daeunki2 2명 모이면 세션 생성 + 루프 시작 =====
    this.handleJoinQueueRuntime(client);
  }

  @SubscribeMessage(GAME_MOVE_PADDLE_EVENT)
  onMovePaddle(client: Socket, payload: MovePaddlePayload) {
    const userId = client.data.userId;
//    console.log(`[Game] ${GAME_MOVE_PADDLE_EVENT} 수신 (stub): userId=${userId}`, payload);
    // ===== daeunki2 p1/p2 판별 후 엔진 이동 반영 =====
    this.handleMovePaddleRuntime(client, payload);
  }

  // ===== daeunki2 구현 영역 시작 =====
  // 대기열 슬롯:
  private waitingSocketId: string | null = null;

  // 실행 중 게임 세션 저장소
  private readonly sessions = new Map<string, RuntimeGameSession>();

  // 소켓 역인덱스
  // move_paddle, disconnect 이벤트는 socketId로 들어오기 때문에
  // socketId -> gameId 매핑을 유지해야 O(1)로 세션을 찾을 수 있다.
  private readonly socketToGameId = new Map<string, string>();

  // 연결 종료 처리 (disconnect)
  // 1) 대기열에 있던 유저가 나가면 대기 슬롯 비움
  // 2) 게임 중 유저가 나가면 해당 게임 세션 종료 (나간 사람이 진거임.)
  //    -> interval 정지 + 맵 정리까지 endSession에서 일괄 수행
  private handleDisconnectRuntime(client: Socket): void {
    if (this.waitingSocketId === client.id) {
      this.waitingSocketId = null;
    }
    const gameId = this.socketToGameId.get(client.id);
    if (!gameId) return;

    // 이탈(기권) 패배 처리:
    const session = this.sessions.get(gameId);
    if (session) {
      const disconnectedIsP1 = session.p1SocketId === client.id;
      const winnerId = disconnectedIsP1 ? session.p2UserId : session.p1UserId;
      const result = {
        winnerId,
        score1: session.state.score1,
        score2: session.state.score2,
      };
      // daeunki2수정 : 수정이유
      // 비정상 종료(연결 끊김)는 끊긴 사람이 패배라는 정책을 DB에도 동일하게 반영한다.
      void this.saveGameRecord(session, winnerId, 'forfeit');
      // 현재 남아있는 상대뿐 아니라(있다면) 양쪽 모두에 동일 결과를 전송
      this.server.to(session.p1SocketId).emit(GAME_OVER_EVENT, result);
      this.server.to(session.p2SocketId).emit(GAME_OVER_EVENT, result);
    }

    this.endSession(gameId);
  }

  // join_queue 처리
  // - 이미 게임 중인 소켓은 중복 요청 무시
  // - 대기자가 없으면 현재 유저를 대기열에 등록
  // - 대기자가 있으면 2인 세션 생성 후 게임 루프 시작
  private handleJoinQueueRuntime(client: Socket): void {
    const userId = client.data.userId;
    // 중복 입장 방지: 이미 다른 게임에 속한 유저는 재등록하지 않음
    if (this.socketToGameId.has(client.id)) return;

    // 대기열이 비었으면 현재 유저를 "첫 번째 대기자"로 등록
    // 동일 소켓이 다시 눌러도 상태를 유지하며 대기 응답만 보냄
    if (!this.waitingSocketId || this.waitingSocketId === client.id) {
      this.waitingSocketId = client.id;
      client.emit('queue_waiting', { ok: true });
      return;
    }

    // 기존 대기자 소켓 조회
    // daeunki2수정 : 수정이유 - 이 Gateway는 namespace('game')로 동작하므로
    // 주입된 server 자체가 Namespace다. 소켓은 Namespace.sockets(Map)에서 직접 조회한다.
    const waitingClient = this.server.sockets.get(this.waitingSocketId);
    const waitingUserId = waitingClient?.data?.userId;
    const waitingNickname = waitingClient?.data?.nickname;
    const currentNickname = client.data.nickname;

    // 대기자 소켓이 유효하지 않으면(이미 끊김 등)
    // 현재 유저를 새 대기자로 설정하고 다음 유저를 기다린다.
    if (!waitingClient || !waitingUserId) {
      this.waitingSocketId = client.id;
      client.emit('queue_waiting', { ok: true });
      return;
    }

    // gameId 생성: 로그 추적/세션 구분용
    const gameId = `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // 엔진 초기 상태 생성 (공/패들/점수/속도 초기화)
    const state = this.engine.createInitialState();

    // p1=기존 대기자, p2=방금 들어온 유저로 고정
    // (입력 라우팅/결과 계산 시 기준이 됨)
    const sessionBase = {
      gameId,
      p1SocketId: waitingClient.id,
      p2SocketId: client.id,
      p1UserId: String(waitingUserId),
      p2UserId: String(userId),
      p1Nickname: String(waitingNickname ?? waitingUserId),
      p2Nickname: String(currentNickname ?? userId),
      state,
    };

    // 소켓 역인덱스 등록
    this.socketToGameId.set(waitingClient.id, gameId);
    this.socketToGameId.set(client.id, gameId);

    // 대기열 비움 (2인 매칭이 성립했으므로)
    this.waitingSocketId = null;

    // daeunki2수정 : 수정이유
    // 실게임 매칭이 성립한 시점이므로 두 유저를 IN_GAME 상태로 전환한다.
    void this.publishPresenceEvent(sessionBase.p1UserId, 'game_started', { gameId });
    void this.publishPresenceEvent(sessionBase.p2UserId, 'game_started', { gameId });

    // 60fps 게임 루프
    // tick마다 수행:
    // 1) 엔진 업데이트(공 이동/충돌/득점)
    // 2) 양쪽 소켓에 최신 상태(game_state) 전송
    // 3) 승점 도달 시 game_over 전송 후 세션 종료
    const timer = setInterval(() => {
      const session = this.sessions.get(gameId);
      if (!session) return;
      const prevScore1 = session.state.score1;
      const prevScore2 = session.state.score2;
      session.state = this.engine.updateTick(session.state);

      // daeunki2수정 : 수정이유
      // 점수 미반영 이슈를 빠르게 진단하기 위해 점수가 실제로 변경되는 순간만 로그를 남긴다.
      if (
        session.state.score1 !== prevScore1 ||
        session.state.score2 !== prevScore2
      ) {
        console.log(
          `[Game] score changed: gameId=${gameId} ${prevScore1}:${prevScore2} -> ${session.state.score1}:${session.state.score2}`,
        );
      }

      this.server.to(session.p1SocketId).emit(GAME_STATE_EVENT, session.state);
      this.server.to(session.p2SocketId).emit(GAME_STATE_EVENT, session.state);
      const result = this.engine.getGameResultIfOver(
        session.state,
        session.p1UserId,
        session.p2UserId,
      );
      if (!result) return;

      // 두 플레이어에게 동일 결과를 전송해 UI 불일치 방지
      this.server.to(session.p1SocketId).emit(GAME_OVER_EVENT, result);
      this.server.to(session.p2SocketId).emit(GAME_OVER_EVENT, result);
      // daeunki2수정 : 수정이유
      // 정상 종료 시 최종 점수/승자를 game-db에 저장해 기록을 남긴다.
      void this.saveGameRecord(session, result.winnerId, 'normal');
      this.endSession(gameId);
    }, 1000 / 60);

    // 타이머 포함 최종 세션 등록
    this.sessions.set(gameId, { ...sessionBase, timer });
  }

  // move_paddle 처리
  // - 이벤트 보낸 소켓이 p1인지 p2인지 판별
  // - 엔진 movePaddle() 호출로 해당 패들 위치만 갱신
  private handleMovePaddleRuntime(client: Socket, payload: MovePaddlePayload): void {
    const gameId = this.socketToGameId.get(client.id);
    if (!gameId) return;
    const session = this.sessions.get(gameId);
    if (!session) return;
    const player: PlayerSlot = session.p1SocketId === client.id ? 'p1' : 'p2';
    session.state = this.engine.movePaddle(session.state, player, payload.direction);
  }

  // 세션 종료 공통 정리
  // - clearInterval: 게임 루프 중단 (필수)
  // - socketToGameId 삭제: 역인덱스 정리
  // - sessions 삭제: 세션 본체 제거
  // 이 정리가 빠지면 유령 세션/메모리 누수/중복 루프 문제가 생길 수 있다.
  private endSession(gameId: string): void {
    const session = this.sessions.get(gameId);
    if (!session) return;

    // daeunki2수정 : 수정이유
    // 세션 종료(정상 종료/기권 종료 공통) 시 두 유저의 inGame 플래그를 해제한다.
    void this.publishPresenceEvent(session.p1UserId, 'game_ended', { gameId });
    void this.publishPresenceEvent(session.p2UserId, 'game_ended', { gameId });

    clearInterval(session.timer);
    this.socketToGameId.delete(session.p1SocketId);
    this.socketToGameId.delete(session.p2SocketId);
    this.sessions.delete(gameId);
  }

  // daeunki2수정 : 수정이유
  // 게임 서비스에서 시작/종료 상태를 백엔드 기준으로 강제 동기화한다.
  // 실패해도 게임 루프를 막지 않도록 fire-and-forget + 에러 로그만 남긴다.
  private async publishPresenceEvent(
    userId: string,
    type: 'game_started' | 'game_ended',
    meta?: Record<string, unknown>,
  ): Promise<void> {
    const payload = {
      eventId: randomUUID(),
      userId,
      type,
      source: 'game-service',
      seq: Date.now(),
      at: new Date().toISOString(),
      version: 1 as const,
      meta,
    };
    try {
      const response = await fetch(this.presenceEventsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        console.warn(
          `[Game] presence event publish failed: status=${response.status}, userId=${userId}, type=${type}`,
        );
      }
    } catch (error) {
      console.warn(
        `[Game] presence event publish error: userId=${userId}, type=${type}`,
        error,
      );
    }
  }

  // daeunki2수정 : 수정이유
  // 게임 종료 결과를 game-db에 영속 저장한다.
  private async saveGameRecord(
    session: RuntimeGameSession,
    winnerId: string,
    endedReason: 'normal' | 'forfeit',
  ): Promise<void> {
    const winnerIsP1 = winnerId === session.p1UserId;
    const loserId = winnerIsP1 ? session.p2UserId : session.p1UserId;
    const winnerNickname = winnerIsP1 ? session.p1Nickname : session.p2Nickname;
    const loserNickname = winnerIsP1 ? session.p2Nickname : session.p1Nickname;
    try {
      await this.gameRecordRepository.save({
        player1Id: session.p1UserId,
        player2Id: session.p2UserId,
        winnerId,
        loserId,
        winnerNickname,
        loserNickname,
        player1Score: session.state.score1,
        player2Score: session.state.score2,
        endedReason,
      });
    } catch (error) {
      console.warn(
        `[Game] game record save failed: gameId=${session.gameId}, reason=${endedReason}`,
        error,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Namespace, Socket } from 'socket.io';
import {
  GAME_OVER_EVENT,
  GAME_STATE_EVENT,
} from './game-engine.constants';
import type { EngineState, MovePaddlePayload, PlayerSlot } from './game-engine.types';
import { GameEngineService } from './game-engine.service';
import { GameRecordEntity } from '../game-record.entity';
import type { MatchResult } from '../matchmaking/matchmaking.service';
import { GameRedis } from '../redis/game.redis';

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

@Injectable()
export class GameRuntimeService {
  // merge수정 : daeunki2의 Gateway 내부 실행 세션 저장소를 별도 서비스로 이동함.
  private readonly sessions = new Map<string, RuntimeGameSession>();
  private readonly socketToGameId = new Map<string, string>();
  private readonly pendingDisconnectByUser = new Map<string, NodeJS.Timeout>();
  private readonly reconnectGraceMs = 5000;

  constructor(
    private readonly engine: GameEngineService,
    private readonly gameRedis: GameRedis,
    @InjectRepository(GameRecordEntity)
    private readonly gameRecordRepository: Repository<GameRecordEntity>,
  ) {}

  async startMatch(match: MatchResult, server: Namespace): Promise<void> {
    const { session, p1SocketId, p2SocketId } = match;
    if (this.sessions.has(session.gameId)) {
      return;
    }

    const p1Socket = server.sockets.get(p1SocketId);
    const p2Socket = server.sockets.get(p2SocketId);
    if (!p1Socket || !p2Socket) {
      // merge수정 : main 매칭 직후 소켓이 사라진 예외 상황에서는 Redis 세션을 정리해 ALREADY_IN_GAME 고착을 막음.
      await this.gameRedis.deleteSession(session.gameId);
      return;
    }

    const runtimeSession: RuntimeGameSession = {
      gameId: session.gameId,
      p1SocketId,
      p2SocketId,
      p1UserId: session.p1,
      p2UserId: session.p2,
      p1Nickname: this.getSocketNickname(p1Socket, session.p1),
      p2Nickname: this.getSocketNickname(p2Socket, session.p2),
      state: this.engine.createInitialState(),
      timer: setInterval(() => this.tick(session.gameId, server), 1000 / 60),
    };

    this.sessions.set(session.gameId, runtimeSession);
    this.socketToGameId.set(p1SocketId, session.gameId);
    this.socketToGameId.set(p2SocketId, session.gameId);
  }

  async reconnectToGame(gameId: string, client: Socket, server: Namespace): Promise<boolean> {
    const session = this.sessions.get(gameId);
    const userId = client.data.userId;
    if (!session || !userId) {
      return false;
    }

    const side = this.getPlayerSide(session, userId);
    if (!side) {
      return false;
    }

    this.clearPendingDisconnect(userId);

    if (side === 'p1') {
      this.socketToGameId.delete(session.p1SocketId);
      session.p1SocketId = client.id;
      session.p1Nickname = this.getSocketNickname(client, userId);
    } else {
      this.socketToGameId.delete(session.p2SocketId);
      session.p2SocketId = client.id;
      session.p2Nickname = this.getSocketNickname(client, userId);
    }
    this.socketToGameId.set(client.id, gameId);

    const room = `game:${gameId}`;
    await server.in(client.id).socketsJoin(room);
    client.emit('match_found', {
      gameId,
      side,
      opponent: side === 'p1' ? session.p2UserId : session.p1UserId,
    });
    client.emit(GAME_STATE_EVENT, session.state);
    return true;
  }

  handleDisconnect(client: Socket, server: Namespace): void {
    const gameId = this.socketToGameId.get(client.id);
    if (!gameId) {
      return;
    }
    const session = this.sessions.get(gameId);
    if (!session) {
      this.socketToGameId.delete(client.id);
      return;
    }

    const userId = session.p1SocketId === client.id ? session.p1UserId : session.p2UserId;
    this.socketToGameId.delete(client.id);

    // merge수정 : HomePage -> GamePage 이동 중 소켓이 교체되는 시간을 허용하고, 유예 후에도 복귀하지 않으면 기권 처리함.
    this.clearPendingDisconnect(userId);
    const timer = setTimeout(() => {
      void this.forfeitIfStillDisconnected(gameId, userId, server);
    }, this.reconnectGraceMs);
    this.pendingDisconnectByUser.set(userId, timer);
  }

  movePaddle(client: Socket, payload: MovePaddlePayload): void {
    const gameId = this.socketToGameId.get(client.id);
    if (!gameId) return;
    const session = this.sessions.get(gameId);
    if (!session) return;

    const player: PlayerSlot = session.p1SocketId === client.id ? 'p1' : 'p2';
    session.state = this.engine.movePaddle(session.state, player, payload.direction);
  }

  private tick(gameId: string, server: Namespace): void {
    const session = this.sessions.get(gameId);
    if (!session) return;

    const prevScore1 = session.state.score1;
    const prevScore2 = session.state.score2;
    session.state = this.engine.updateTick(session.state);

    if (
      session.state.score1 !== prevScore1 ||
      session.state.score2 !== prevScore2
    ) {
      console.log(
        `[Game] score changed: gameId=${gameId} ${prevScore1}:${prevScore2} -> ${session.state.score1}:${session.state.score2}`,
      );
    }

    server.to(session.p1SocketId).emit(GAME_STATE_EVENT, session.state);
    server.to(session.p2SocketId).emit(GAME_STATE_EVENT, session.state);

    const result = this.engine.getGameResultIfOver(
      session.state,
      session.p1UserId,
      session.p2UserId,
    );
    if (!result) return;

    server.to(session.p1SocketId).emit(GAME_OVER_EVENT, result);
    server.to(session.p2SocketId).emit(GAME_OVER_EVENT, result);
    void this.saveGameRecord(session, result.winnerId, 'normal');
    void this.endSession(gameId);
  }

  private async forfeitIfStillDisconnected(
    gameId: string,
    disconnectedUserId: string,
    server: Namespace,
  ): Promise<void> {
    this.pendingDisconnectByUser.delete(disconnectedUserId);
    const session = this.sessions.get(gameId);
    if (!session) return;

    const side = this.getPlayerSide(session, disconnectedUserId);
    if (!side) return;
    const activeSocketId = side === 'p1' ? session.p1SocketId : session.p2SocketId;
    if (this.socketToGameId.get(activeSocketId) === gameId) {
      return;
    }

    const winnerId = side === 'p1' ? session.p2UserId : session.p1UserId;
    const result = {
      winnerId,
      score1: session.state.score1,
      score2: session.state.score2,
    };

    server.to(session.p1SocketId).emit(GAME_OVER_EVENT, result);
    server.to(session.p2SocketId).emit(GAME_OVER_EVENT, result);
    await this.saveGameRecord(session, winnerId, 'forfeit');
    await this.endSession(gameId);
  }

  private async endSession(gameId: string): Promise<void> {
    const session = this.sessions.get(gameId);
    if (!session) return;

    clearInterval(session.timer);
    this.socketToGameId.delete(session.p1SocketId);
    this.socketToGameId.delete(session.p2SocketId);
    this.clearPendingDisconnect(session.p1UserId);
    this.clearPendingDisconnect(session.p2UserId);
    this.sessions.delete(gameId);

    // merge수정 : main의 Redis presence/session 구조를 따르기 위해 HTTP internal 호출 대신 GameRedis를 사용함.
    await Promise.all([
      this.gameRedis.publishPresence(session.p1UserId, 'game_ended'),
      this.gameRedis.publishPresence(session.p2UserId, 'game_ended'),
      this.gameRedis.deleteSession(gameId),
    ]);
  }

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

  private getSocketNickname(client: Socket, fallback: string): string {
    const nickname = client.data.nickname;
    return typeof nickname === 'string' && nickname.trim() !== ''
      ? nickname
      : fallback;
  }

  private getPlayerSide(session: RuntimeGameSession, userId: string): PlayerSlot | null {
    if (session.p1UserId === userId) return 'p1';
    if (session.p2UserId === userId) return 'p2';
    return null;
  }

  private clearPendingDisconnect(userId: string): void {
    const timer = this.pendingDisconnectByUser.get(userId);
    if (!timer) return;
    clearTimeout(timer);
    this.pendingDisconnectByUser.delete(userId);
  }
}

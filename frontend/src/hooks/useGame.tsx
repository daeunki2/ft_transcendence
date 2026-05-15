/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useGame.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 11:13:24 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/11 12:28:15 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface GameState {
  ballX: number;	// 공 좌표
  ballY: number;
  p1Y: number;		// 플레이어 1, 2 좌표(위 아래여서 Y자표로 충분)
  p2Y: number;
  score1: number;	//스코어
  score2: number;
}

// 이유: 서버 match_found 페이로드. 다음 게임 페이지가 그대로 사용 (gameId=방 식별, side=내 패들, opponent=상대 표시).
// navigate는 다음 페이지 담당자가 처리할 영역이라 이 훅에선 상태만 노출.
export interface MatchInfo {
  gameId: string;
  side: 'p1' | 'p2';
  opponent: string;
}

// 이유: 서버 queue_error 페이로드. join_queue 거절 사유를 프론트가 분기 처리하기 위함.
// code 는 백엔드 game.gateway.ts 의 queue_error emit 시 사용하는 값과 1:1로 맞춰야 한다.
export interface QueueError {
  code: 'UNAUTHENTICATED' | 'ALREADY_IN_GAME' | string;
  message: string;
  gameId?: string;
}

export const useGame = (currentUserId: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [queueError, setQueueError] = useState<QueueError | null>(null);

  // 대기열 추가
  const joinQueue = useCallback(() => {
  if (socketRef.current && isConnected) {
    console.log('[Game Socket] 대기열 등록 시도:', currentUserId);
    socketRef.current.emit('join_queue');
  } else {
    console.error('[Game Socket] 소켓이 연결되지 않았습니다.');
  }
}, [isConnected, currentUserId]);

//패들 이동
const movePaddle = useCallback((direction: 'up' | 'down') => {
  if (socketRef.current && isConnected) {
    socketRef.current.emit('move_paddle', { direction });
  }
}, [isConnected]);

  useEffect(() => {
	if (!currentUserId || currentUserId === 'undefined'|| currentUserId === 'null'){
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
	setIsConnected(false);
  	setGameState(null);
	setMatchInfo(null);
	setQueueError(null);
    return;
  }
   
    const socket = io('http://localhost:8000/game', {
	  path: '/api/game/socket.io',
	  withCredentials: true,
      transports: ['polling','websocket'], 
      query: {
        userId: currentUserId 
    },

     reconnection: true,            // 재연결 활성화
     reconnectionAttempts: 10,      // 재시도 횟수
     reconnectionDelay: 1000,       // 실패 시 1초(길수도 있음)
     reconnectionDelayMax: 5000,    // 대기시간 최대 5초까지만 늘어나게 설정
     timeout: 10000,                // 타임아웃 10초
    });

	socketRef.current = socket;

    socket.on('connect', () => {
	  setIsConnected(true);
      console.log('[Game Socket] 게이트웨이 인증 통과 및 연결 성공');
    });

    socket.on('connect_error', (err) => {
      console.error('[Game Socket] 연결 에러:', err.message);
      setIsConnected(false);
      
      // 인증 에러(401, 403 등)가 명확할 경우 재연결 수동 중단
      if (err.message.includes('authentication') || err.message.includes('token')) {
        console.warn('[Game Socket] 인증 문제로 재연결을 중단합니다.');
        socket.disconnect();
      }
    });
	
	socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Game Socket] 연결 종료 사유:', reason);
      
      // 서버에 의해 강제로 끊긴 경우(io server disconnect) 자동 재연결 안 함
      if (reason === 'io server disconnect') {
        // socket.connect(); // 필요할 때만 수동으로 호출하도록 방치
      }
    });

	socket.on('game_state', (state: GameState) => {
      setGameState(state); // 데이터가 들어올 때마다 리액트 상태 업데이트
    });

    // 이유: 매칭 성공 시 서버가 각 클라이언트에게 자기 side를 박아 보낸다. 페이로드 그대로 보관.
    // 다음 페이지 전환(예: /game/{gameId}) 은 이 훅을 사용하는 컴포넌트가 matchInfo 변화를 감지해 처리.
    socket.on('match_found', (info: MatchInfo) => {
      console.log('[Game Socket] match_found 수신:', info);
      setMatchInfo(info);
    });

    // 이유: join_queue 거절 사유(UNAUTHENTICATED / ALREADY_IN_GAME 등)를 상태로 보관해
    // 호출 컴포넌트가 모달을 닫거나 알림을 띄우는 분기 처리에 사용한다.
    socket.on('queue_error', (err: QueueError) => {
      console.warn('[Game Socket] queue_error 수신:', err);
      setQueueError(err);
    });

    // 클린업 (언마운트 시 소켓 종료)
    return () => {
      if (socketRef.current) {
        console.log('[Game Socket] 소켓 연결 종료');
        socketRef.current.removeAllListeners(); // 모든 리스너
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUserId]);

  // queueError 는 호출 컴포넌트가 읽어 모달 닫기/알림 표시 후 setQueueError(null) 로 초기화한다.
  const clearQueueError = useCallback(() => setQueueError(null), []);

  return { isConnected, movePaddle, joinQueue, gameState, matchInfo, queueError, clearQueueError };
};
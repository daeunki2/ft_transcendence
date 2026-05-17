/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useGame.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 11:13:24 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 20:29:08 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// merge수정 : main의 인라인 GameState 대신 daeunki2의 공통 게임 타입을 사용해 GamePage/GameBoard와 타입을 맞춤.
import type { GameState, GameResult } from '../types/game';

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

// merge수정 : main의 userId 기반 소켓 연결에 daeunki2의 기록 저장용 nickname 전달 인자를 추가함.
export const useGame = (currentUserId: string | null, shouldConnect: boolean,  currentNickname?: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null);
  const [queueError, setQueueError] = useState<QueueError | null>(null);
  // merge수정 : daeunki2의 game_over 결과 상태를 main의 매칭 상태들과 함께 유지함.
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
 

//Context 리셋함수
const resetGameState = useCallback(() => {
setMatchInfo(null);
  setGameState(null);
  setGameResult(null);
  setQueueError(null);
  // console.log('[Game Hook] 모든 게임 데이터가 초기화되었습니다.');
}, []);
  
 // 대기열 추가
const joinQueue = useCallback(() => {
 if (socketRef.current && isConnected) {
   console.log('[Game Socket] 대기열 등록 시도:', currentUserId);
   socketRef.current.emit('join_queue');
 } else {
   console.error('[Game Socket] 소켓이 연결되지 않았습니다.');
 }
}, [isConnected, currentUserId]);

const joinAiQueue = useCallback(() => {
  if (socketRef.current && isConnected) {
    console.log('[Game Socket] AI 게임 시작 요청');
    // 서버와 약속한 AI 전용 이벤트 송신
    socketRef.current.emit('join_ai_queue');
  }
}, [isConnected, currentUserId]);

// suna : 친구 초대 송신. 소켓이 아직 연결 전이면 connect 이벤트를 한번만 기다린 뒤 emit.
const inviteFriend = useCallback((targetUserId: string) => {
  if (!targetUserId) return;
  const socket = socketRef.current;
  if (!socket) {
    console.warn('[Game Socket] inviteFriend 호출 시 소켓이 활성화돼 있지 않습니다.');
    return;
  }
  if (socket.connected) {
    console.log('[Game Socket] invite_friend 송신:', targetUserId);
    socket.emit('invite_friend', { targetUserId });
    return;
  }
  // 아직 연결 전 (activateGameSocket 직후): 연결되면 한 번만 송신.
  console.log('[Game Socket] 소켓 연결 대기 후 invite_friend 송신 예약:', targetUserId);
  const onceConnected = () => {
    socket.emit('invite_friend', { targetUserId });
  };
  socket.once('connect', onceConnected);
}, []);

//패들 이동
const movePaddle = useCallback((direction: 'up' | 'down') => {
  if (socketRef.current && isConnected) {
    socketRef.current.emit('move_paddle', { direction });
  }
}, [isConnected]);

const sendReady = useCallback(() => {
  if (socketRef.current && isConnected) {
    console.log('[Game Socket] 게임 준비 완료(ready) 송신');
    socketRef.current.emit('ready');
  } else {
    console.warn('[Game Socket] 소켓이 연결되지 않아 ready를 보낼 수 없습니다.');
  }
}, [isConnected]);

  useEffect(() => {
	if (!shouldConnect || !currentUserId || currentUserId === 'undefined'|| currentUserId === 'null'){
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
	  setIsConnected(false);
  	setGameState(null);
	  setMatchInfo(null);
	  setQueueError(null);
	  // merge수정 : 소켓이 닫히는 경우 게임 결과 상태도 함께 초기화함.
	  // setGameResult(null);
    return;
  	}

	if (socketRef.current?.connected) {
    console.log('[Game Socket] 이미 연결된 소켓 유지');
    return;
  	}
   
    const socket = io('http://localhost:8000/game', {
	  path: '/api/game/socket.io',
	  withCredentials: true,
      transports: ['polling', 'websocket'], 
      query: {
        userId: currentUserId,
        // merge수정 : main의 userId query는 유지하고 daeunki2의 nickname query를 추가함.
        // daeunki2수정 : 수정이유
        // 게임 종료 기록에 winner/loser nickname을 저장하기 위해 소켓 연결 시 함께 전달한다.
        nickname: currentNickname ?? '',
      },

    //  reconnection: true,            // 재연결 활성화
    //  reconnectionAttempts: 10,      // 재시도 횟수
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

    socket.on('queue_error', (data: { message: string }) => {
      console.error('[Game Socket] 큐 에러 수신:', data.message);
      setQueueError(data.message);
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

    // suna : 상대가 ready 전에 ESC/disconnect 했을 때 서버가 보내는 신호.
    // matchInfo 를 비워 모달이 "찾는 중" 상태로 되돌아가게 하고, 서버는 알아서 다시 큐에 넣는다.
    socket.on('match_canceled', () => {
      console.log('[Game Socket] match_canceled 수신: 상대 이탈, 재매칭 대기');
      setMatchInfo(null);
    });

    // 이유: join_queue 거절 사유(UNAUTHENTICATED / ALREADY_IN_GAME 등)를 상태로 보관해
    // 호출 컴포넌트가 모달을 닫거나 알림을 띄우는 분기 처리에 사용한다.
    socket.on('queue_error', (err: QueueError) => {
      console.warn('[Game Socket] queue_error 수신:', err);
      setQueueError(err);
    });

    // merge수정 : main의 match_found/queue_error 리스너를 유지하면서 daeunki2의 game_over 리스너를 추가함.
	// Game Over 리스너
    socket.on('game_over', (result: GameResult) => {
      console.log('[Game Socket] 게임 종료 수신:', result);
      setGameResult(result);
      
      // 게임이 종료되었으니 불필요한 game_state 수신은 끊어줍니다.
      socket.off('game_state');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
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
  }, [currentUserId, currentNickname, shouldConnect]);

  // queueError 는 호출 컴포넌트가 읽어 모달 닫기/알림 표시 후 setQueueError(null) 로 초기화한다.
  const clearQueueError = useCallback(() => setQueueError(null), []);

  // merge수정 : main의 매칭 반환값과 daeunki2의 gameResult를 모두 노출함.
  return { isConnected, movePaddle, joinQueue, joinAiQueue, inviteFriend, gameState, matchInfo, queueError, clearQueueError, gameResult, sendReady, resetGameState};
};


/*
충돌 
suna는 소켓을 매칭용으로
daeunki2는 게임용으로 사용하려 함 
그래서 2 다 남기는 방향으로 merge합
*/

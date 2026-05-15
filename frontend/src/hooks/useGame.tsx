/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useGame.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 11:13:24 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 18:43:53 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, GameResult } from '../types/game';

export const useGame = (currentUserId: string | null, shouldConnect: boolean) => {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [matchData, setMatchData] = useState<{ opponent: string } | null>(null);
  const [queueError, setQueueError] = useState<string | null>(null);

//Context 리셋함수
const resetGameState = useCallback(() => {
setMatchData(null);
  setGameState(null);
  setGameResult(null);
  setQueueError(null);
  console.log('[Game Hook] 모든 게임 데이터가 초기화되었습니다.');
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
	if (!currentUserId || currentUserId === 'undefined'|| currentUserId === 'null' || !shouldConnect){
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
	  setIsConnected(false);
  	setGameState(null);
    return;
  	}

	if (socketRef.current?.connected) {
    console.log('[Game Socket] 이미 연결된 소켓 유지');
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

    socket.on('match_found', (data: { opponent: string }) => {
      console.log('[Game Socket] 매칭 성공! 상대방:', data.opponent);
  
      setMatchData(data);
    //  socket.emit('ready'); 
        
      console.log('[Game Socket] 서버에 ready 이벤트를 보냈습니다.');
    });

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
  }, [currentUserId, shouldConnect]);

  return { isConnected, movePaddle, joinQueue, joinAiQueue, gameState, gameResult, sendReady, matchData, queueError, resetGameState};
};
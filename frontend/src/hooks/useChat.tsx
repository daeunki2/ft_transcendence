/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useChat.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/30 13:14:39 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/07 13:12:12 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { chatService } from '../services/chatService'; // HTTP 서비스 추가

interface Message {
  id?: number;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}
export type UserStatus = 'OFFLINE' | 'ONLINE' | 'IN_GAME';

export const useChat = (targetId: string | null, currentUserId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [targetStatus, setTargetStatus] = useState<UserStatus>('OFFLINE');
  const socketRef = useRef<Socket | null>(null);
  // 1. 초기 히스토리 로드 (HTTP API 사용)
  const loadHistory = useCallback(async () => {
  if (!targetId) return;
  try {
    const response = await chatService.getHistory(targetId);
    console.log('[Chat] 가져온 히스토리 데이터:', response);

    // 🛠️ 수정: 객체 형태를 배열로 변환하거나, 배열이 맞는지 다시 확인
    let historyArray = [];
    if (Array.isArray(response)) {
      historyArray = response;
    } else if (typeof response === 'object' && response !== null) 
      historyArray = Object.values(response);
    setMessages(historyArray);
  } catch (err) {
    console.error('[Chat] 히스토리 로드 실패:', err);
    setMessages([]);
  }
}, [targetId]);

const fetchInitialStatus = useCallback(async () => {
  if (!targetId) return;
  try {
    const status = await chatService.getUserStatus(targetId);
    setTargetStatus(status);
  } catch (e) {
    console.error('[Presence] 초기 상태 로드 실패:', e);
  }
}, [targetId]);

  useEffect(() => {
    if (!targetId || !currentUserId || currentUserId === 'undefined') {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    return;
  }

    // 마운트 시 히스토리 먼저 가져오기
    loadHistory();
    fetchInitialStatus();

    // 2. 소켓 연결 설정 (게이트웨이 8000번 포트 경유)
    const socket = io('http://localhost:8000/chat', {
      path: '/api/chat/socket.io', // 게이트웨이가 이 경로를 보고 chat-service로 전달함
      withCredentials: true,      // 브라우저가 자동으로 쿠키(accessToken)를 실어 보냄
      forceNew: true,
      transports: ['websocket'],  // 게이트웨이 환경에서 안정적인 연결을 위해 권장
      query: {
        userId: currentUserId 
    },
      // 로그아웃 시 무한 재시도를 막기 위한 설정 추가
      reconnectionAttempts: 3,     // 최대 3번만 재시도
      reconnectionDelay: 5000,     // 실패 시 5초 대기 후 재시도 (초당 1회 방지)
      reconnectionDelayMax: 10000, // 최대 대기 시간 10초
      timeout: 20000,              // 연결 타임아웃
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] 게이트웨이 인증 통과 및 연결 성공');
    });

    // 실시간 상태 변경 이벤트 수신 (백엔드 Gateway에서 emit할 이벤트)
    socket.on('user_presence_changed', (data: { userId: string; status: UserStatus }) => {
      // 지금 대화 중인 상대방의 상태가 바뀐 경우에만 업데이트
      if (data.userId === targetId) {
        setTargetStatus(data.status);
        console.log(`[Presence] ${targetId}님의 상태 변경: ${data.status}`);
      }
    });

    // 실시간 새 메시지 수신 (내 대화 상대일 때만 추가)
    socket.on('new_dm', (newMessage: Message) => {
      if (newMessage.senderId === targetId || newMessage.receiverId === targetId) {
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          // 🛡️ 중요: 이미 리스트에 같은 ID(진짜 ID)가 있다면 중복해서 넣지 않음
          if (currentMessages.some(m => m.id === newMessage.id)) {
            return currentMessages;
          }
          return [...currentMessages, newMessage];
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] 연결 에러:', err.message);
      setIsConnected(false);
      
      // 🛡️ 4. 인증 에러(401, 403 등)가 명확할 경우 재연결 수동 중단
      if (err.message.includes('authentication') || err.message.includes('token')) {
        console.warn('[Socket] 인증 문제로 재연결을 중단합니다.');
        socket.disconnect();
      }
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket] 연결 종료 사유:', reason);
      
      // 🛡️ 5. 서버에 의해 강제로 끊긴 경우(io server disconnect) 자동 재연결 안 함
      if (reason === 'io server disconnect') {
        // socket.connect(); // 필요할 때만 수동으로 호출하도록 방치
      }
    });

    return () => {
      if (socketRef.current) {
        console.log('[Chat] 소켓 연결 종료');
        socketRef.current.removeAllListeners(); // 모든 리스너
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [targetId, currentUserId, loadHistory, fetchInitialStatus]);

  // 3. 메시지 전송 함수
  const sendMessage = useCallback((content: string) => {
    console.log('[보내기 시도] 소켓 존재여부:', !!socketRef.current);
    console.log('[보내기 시도] 소켓 연결상태:', socketRef.current?.connected);

    if (!socketRef.current || !targetId || !content.trim())
        return;

    const tempId = Date.now(); 

    const tempMsg: Message = {
      id: tempId, // 임시 번호표
      senderId: currentUserId!,
      receiverId: targetId,
      content,
      createdAt: new Date().toISOString(),
    };

    // 화면에 즉시 반영 (낙관적 업데이트)
    setMessages((prev) => [...(Array.isArray(prev) ? prev : []), tempMsg]);

    socketRef.current.emit('send_dm', {
      to: targetId,
      message: content,
    });
   
  }, [targetId, currentUserId]);

  return { messages, sendMessage, isConnected, targetStatus };
};
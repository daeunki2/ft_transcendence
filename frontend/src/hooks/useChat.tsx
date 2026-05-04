/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useChat.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/30 13:14:39 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/02 08:17:53 by chanypar         ###   ########.fr       */
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

export const useChat = (targetId: string | null, currentUserId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // 1. 초기 히스토리 로드 (HTTP API 사용)
  const loadHistory = useCallback(async () => {
    if (!targetId) return;
    try {
      const history = await chatService.getHistory(targetId);
      console.log('[Chat] 가져온 히스토리 데이터:', history);
      setMessages(Array.isArray(history) ? history : []);
    } catch (err) {
      console.error('[Chat] 히스토리 로드 실패:', err);
      setMessages([]); // 에러 시 빈 배열로 초기화하여 'not iterable' 에러 방지
    }
  }, [targetId]);

  useEffect(() => {
    if (!targetId || !currentUserId) return;

    // 마운트 시 히스토리 먼저 가져오기
    loadHistory();

    // 2. 소켓 연결 설정 (게이트웨이 8000번 포트 경유)
    const socket = io('http://localhost:8000/chat', {
      path: '/api/chat/socket.io', // 게이트웨이가 이 경로를 보고 chat-service로 전달함
      withCredentials: true,      // 브라우저가 자동으로 쿠키(accessToken)를 실어 보냄
      transports: ['websocket'],  // 게이트웨이 환경에서 안정적인 연결을 위해 권장
      query: {
        userId: currentUserId 
    }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket] 게이트웨이 인증 통과 및 연결 성공');
    });

    // 실시간 새 메시지 수신 (내 대화 상대일 때만 추가)
    socket.on('new_dm', (newMessage: Message) => {
      if (newMessage.senderId === targetId || newMessage.receiverId === targetId) {
        setMessages((prev) => {
          const currentMessages = Array.isArray(prev) ? prev : [];
          return [...currentMessages, newMessage];
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] 연결 에러 (인증 실패 가능성):', err.message);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [targetId, currentUserId, loadHistory]);

  // 3. 메시지 전송 함수
  const sendMessage = useCallback((content: string) => {
    console.log('[보내기 시도] 소켓 존재여부:', !!socketRef.current);
    console.log('[보내기 시도] 소켓 연결상태:', socketRef.current?.connected);

    if (!socketRef.current || !targetId || !content.trim()) {
        console.log('[보내기 중단] 원인:', { 
            noSocket: !socketRef.current, 
            noTarget: !targetId, 
            noContent: !content.trim() 
        });
        return;
    }

    socketRef.current.emit('send_dm', {
      to: targetId,
      message: content,
    });

    // 낙관적 업데이트
    const tempMsg: Message = {
      senderId: currentUserId!,
      receiverId: targetId,
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => {
      const currentMessages = Array.isArray(prev) ? prev : [];
      return [...currentMessages, tempMsg];
    });
  }, [targetId, currentUserId]);

  return { messages, sendMessage, isConnected };
};
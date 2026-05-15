/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useGameHistory.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/12 12:01:28 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 14:12:50 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect, useCallback } from 'react';
import { gameService } from '../services/gameService';
import { useI18n } from '../i18n/useI18n';
import type { GameRecord } from '../types/game';

export const useGameHistory = (userId: string | null) => {
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const { messages } = useI18n();

  const fetchHistory = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setAlertMsg(null); // 새로운 요청 시 이전 에러 초기화

    try {
      // 1. 서비스 호출 (아까 만든 gameService 사용)
      const data = await gameService.fetchHistory(userId);

      // 2. 성공 시 데이터 저장
      // 데이터가 없을 경우를 대비해 Array.isArray 체크를 넣어주면 더 안전합니다.
      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }
    } catch (error: any) {
      console.error("전적 로딩 에러:", error);
      
      // 3. 에러 발생 시 번역된 메시지 세팅 (기본 서버 에러 사용)
      const errorKey = error?.response?.data?.message;
      const translated = (messages.errors as any)[errorKey] || messages.errors?.SERVER_ERROR || "Server Error";
      
      setAlertMsg(translated);
      setHistory([]); // 에러 시 빈 배열로 초기화하여 map 에러 방지
    } finally {
      setIsLoading(false);
    }
  }, [userId, messages.errors]);

  // 마운트 시 혹은 userId 변경 시 실행
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    history, 
    isLoading, 
    alertMsg, 
    setAlertMsg,
    refetch: fetchHistory // 필요 시 수동으로 새로고침 할 수 있도록 반환
  };
};
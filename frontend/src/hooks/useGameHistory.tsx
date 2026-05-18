/* ************************************************************************** */
/* */
/* :::      ::::::::   */
/* useGameHistory.tsx                                 :+:      :+:    :+:   */
/* +:+ +:+         +:+     */
/* By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/* +#+#+#+#+#+   +#+           */
/* Created: 2026/05/12 12:01:28 by chanypar          #+#    #+#             */
/* Updated: 2026/05/17 11:22:00 by chanypar         ###   ########.fr       */
/* */
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
    setAlertMsg(null);

    try {
      const data = await gameService.fetchHistory(userId);

      // 백엔드가 배열([]) 대신 인덱스 객체를 뱉을 때를 위한 방어 로직
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && typeof data === 'object') {
        setHistory(Object.values(data));
      } else {
        setHistory([]);
      }
    } catch (error: any) {
      console.error("전적 로딩 에러:", error);
      
      const errorKey = error?.response?.data?.message;
      const translated = (messages.errors as any)[errorKey] || messages.errors?.SERVER_ERROR || "Server Error";
      
      setAlertMsg(translated);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, messages.errors]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    history, 
    isLoading, 
    alertMsg, 
    setAlertMsg,
    refetch: fetchHistory
  };
};
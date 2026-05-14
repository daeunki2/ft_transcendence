/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   useGameHistory.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/12 12:01:28 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/12 12:01:31 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState, useEffect } from 'react';
import { gameService } from '../services/gameService';
import type { GameRecord } from '../types/game';

export const useGameHistory = (userId: string | null) => {
  const [history, setHistory] = useState<GameRecord[]>([]); // 초기값 빈 배열
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getHistory = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // gameService를 호출합니다.
        const data = await gameService.fetchHistory(userId);
        
        // 데이터가 배열인지 확인 후 저장 (안전장치)
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('전적 로드 실패:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    getHistory();
  }, [userId]);

  return { history, isLoading };
};
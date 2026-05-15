/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/15 14:52:48 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 15:00:04 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { createContext, useContext, useMemo, useEffect, useState, useCallback, ReactNode } from 'react';
import { useGame } from '../hooks/useGame';
import { useAuth } from './AuthContext';

type GameContextType = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // 소켓 연결 스위치 (기본값은 false)
  const [shouldConnect, setShouldConnect] = useState(false);

  // useGame에 userId와 연결 스위치를 함께 전달
  const game = useGame(user?.userId ?? null, shouldConnect);

  // 사용자가 로그아웃하거나 수동으로 세션을 정리할 때 처리
  useEffect(() => {
    if (!user) {
      console.log('[GameProvider] 사용자가 로그아웃하여 게임 세션을 정리합니다.');
      setShouldConnect(false); // 로그아웃 시 스위치도 끔
      game.resetGameState();
    }
  }, [user, game]);

  // HomePage 등에서 호출할 "소켓 활성화" 함수
  const activateGameSocket = useCallback(() => {
    setShouldConnect(true);
  }, []);

  // game 객체에 activateGameSocket 함수를 합쳐서 전달
  const value = useMemo(() => ({
    ...game,
    activateGameSocket
  }), [game, activateGameSocket]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('GameProvider missing');
  return ctx;
};
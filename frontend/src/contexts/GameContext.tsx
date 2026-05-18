/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameContext.tsx                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/15 14:52:48 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/18 15:13:23 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { createContext, useContext, useMemo, useEffect, useState, useCallback, ReactNode } from 'react';
import { useGame } from '../hooks/useGame';
import { useAuth } from './AuthContext';

type GameContextType = ReturnType<typeof useGame> & {
  activateGameSocket: () => void;
  deactivateGameSocket: () => void;
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  
  // 소켓 연결 스위치 (기본값은 false)
  const [shouldConnect, setShouldConnect] = useState(false);

  const canConnect = useMemo(() => {
    return !!user && shouldConnect;
  }, [user, shouldConnect]);

  // useGame에 userId와 연결 스위치를 함께 전달
  const game = useGame(user?.userId ?? null, canConnect,user?.nickname);

  // 1. 로그아웃 및 게임 종료 감지 로직
  useEffect(() => {
    // Case A: 사용자가 로그아웃했을 때
    if (!user) {
      // console.log('[GameProvider] 사용자가 로그아웃하여 세션을 정리합니다.');
      setShouldConnect(false);
      game.resetGameState();
      return;
    }

    // Case B: 게임 결과(gameResult)가 나왔을 때 즉시 소켓 종료
    if (game.gameResult) {
      console.log('[GameProvider] 게임 종료 감지: 소켓 연결을 해제합니다.');
      setShouldConnect(false);
      // 참고: game.resetGameState()는 결과 화면을 보여줘야 하므로 
      // 여기서 바로 부르지 말고, 유저가 '확인' 버튼을 누르거나 페이지를 나갈 때 부르는 게 좋습니다.
    }
  }, [user, game.gameResult]); // gameResult를 의존성에 추가!

  //  수동 종료 함수 (매칭 취소 시 사용)
  const deactivateGameSocket = useCallback(() => {
    setShouldConnect(false);
    game.resetGameState();
  }, [game]);

  // HomePage 등에서 호출할 "소켓 활성화" 함수
  const activateGameSocket = useCallback(() => {
    setShouldConnect(true);
  }, []);

  // game 객체에 activateGameSocket 함수를 합쳐서 전달
  const value = useMemo(() => ({
    ...game,
    activateGameSocket,
    deactivateGameSocket
  }), [game, activateGameSocket, deactivateGameSocket]);

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
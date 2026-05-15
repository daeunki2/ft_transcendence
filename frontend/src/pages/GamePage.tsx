/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GamePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 21:25:37 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 14:46:59 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import GameBoard from '../components/game/GameBoard';
import { useGameContext } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/useI18n';
import React, { useEffect } from 'react';

export default function GamePage() {

	const { user } = useAuth();
	// 게임 페이지에 들어오자마자 소켓 연결 및 데이터 수신 시작
	const { gameState, movePaddle, matchData, gameResult, isConnected } = useGameContext();
	const { messages } = useI18n();

	useEffect(() => {
  	const handleKeyDown = (e: KeyboardEvent) => {
    	if (e.key.toLowerCase() === 'w') movePaddle('up');
    	if (e.key.toLowerCase() === 's') movePaddle('down');
  	};

  	if (isConnected) {
    window.addEventListener('keydown', handleKeyDown);
  	}
  	return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isConnected, movePaddle]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      color: '#fff',
      paddingTop: '40px'
    }}>
      <h1 style={{ marginBottom: '20px', letterSpacing: '4px' }}>PONG MATCH</h1>
      
      {isConnected ? (
        <>
          <GameBoard 
            data={gameState} 
            meName={user?.nickname || 'ME'} 
            opponentName={matchData?.opponent || 'OPPONENT'} 
          />
          
          {gameResult && (
            <div style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {gameResult.winner === user?.userId ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
            </div>
          )}
        </>
      ) : (
        <p>{messages.HomePage.connectGameServer}</p>
      )}
      
      <p style={{ marginTop: '20px', color: '#888' }}>
        {messages.game.movePaddle} (W / S)
      </p>
    </div>
  );
}
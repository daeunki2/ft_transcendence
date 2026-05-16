/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GamePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/11 21:25:37 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/15 21:14:20 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import GameBoard from '../components/game/GameBoard';
import { useGameContext } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n/useI18n';
import React, { useEffect, useRef } from 'react';

export default function GamePage() {

	const { user } = useAuth();
	// 게임 페이지에 들어오자마자 소켓 연결 및 데이터 수신 시작
	const { gameState, movePaddle, matchInfo, gameResult, isConnected, joinQueue } = useGameContext();
	const { messages } = useI18n();
	const inputStateRef = useRef({ up: false, down: false });

	// suna : 매칭/ready 핸드셰이크가 HomePage 모달에서 끝난 뒤 첫 gameState 가 도착해야 /game 으로 오게 바뀜.
	// 즉 도착 시점에 이미 서버 game loop 가 돌고 있어서 별도 join_queue 가 필요 없음.
	// 기존 흐름 보존을 위해 호출만 주석 처리.
	// useEffect(() => {
	// 	// daeunki2수정 : 수정이유
	// 	// HomePage에서 /game 이동 시 기존 소켓이 정리되고, GamePage에서 새 소켓이 열린다.
	// 	// 따라서 연결 직후 이 페이지에서 큐 재등록을 1회 수행해야 game_state를 다시 수신할 수 있다.
	// 	if (!isConnected) return;
	// 	joinQueue();
	// }, [isConnected, joinQueue]);

	useEffect(() => {
		// daeunki2수정 : 수정이유
		// keydown 1회당 1번 전송 방식은 패들이 끊겨 보인다.
		// 키 상태를 유지(up/down)하고 짧은 주기로 연속 전송해 부드럽게 움직이게 한다.
		const handleKeyDown = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (key === 'w') inputStateRef.current.up = true;
			if (key === 's') inputStateRef.current.down = true;
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (key === 'w') inputStateRef.current.up = false;
			if (key === 's') inputStateRef.current.down = false;
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		const interval = setInterval(() => {
			if (!isConnected) return;
			if (inputStateRef.current.up && !inputStateRef.current.down) {
				movePaddle('up');
			} else if (inputStateRef.current.down && !inputStateRef.current.up) {
				movePaddle('down');
			}
		}, 1000 / 60);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			clearInterval(interval);
			inputStateRef.current.up = false;
			inputStateRef.current.down = false;
		};
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
      
      <div style={{ position: 'relative' }}> {/* 🚩 결과창의 기준점 */}
      {isConnected || gameResult ? (
        <GameBoard 
          data={gameState} 
          meName={user?.nickname || 'ME'} 
          opponentName={matchInfo?.opponent || 'OPPONENT'} 
        />
      ) : (
        <p>{messages.game.connectGameServer}</p>
      )}

      {/* 🚩 결과가 나오면 보드 정중앙에 띄움 */}
      {gameResult && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', // 정중앙 정렬
          padding: '40px', borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)', // 보드가 비치게 약간 투명하게
          border: '3px solid gold', fontSize: '32px',
          fontWeight: 'bold', textAlign: 'center', minWidth: '300px'
        }}>
          {gameResult.winnerId === user?.userId ? messages.game.winner: messages.game.loser}
          <button onClick={() => window.location.href = '/home'} style={{ /* 버튼 스타일 */ }}>
            {messages.game.backHome}
          </button>
        </div>
      )}
    </div>

    {!gameResult && (
      <p style={{ marginTop: '20px', color: '#888' }}>
        {messages.game.movePaddle} (W / S)
      </p>
    )}
  </div>
);
}

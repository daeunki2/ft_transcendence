/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameBoard.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/12 09:49:50 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/14 21:12:51 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;

interface GameBoardProps {
  data: GameState | null;
  meName?: string;
  opponentName?: string;
}

export default function GameBoard({ data, meName = 'Me', opponentName = 'Opponent' }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const stateRef = useRef<GameState | null>(null);

  useEffect(() => {
    stateRef.current = data;
  }, [data]);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (!s) {
      requestRef.current = requestAnimationFrame(render);
      return;
    }

    // 중앙 점선
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();

    // 패들 & 공 그리기
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    
    // 왼쪽 패들
    ctx.fillRect(20, s.p1Y, PADDLE_WIDTH, PADDLE_HEIGHT); 
    // 오른쪽 패들
    ctx.fillRect(GAME_WIDTH - 35, s.p2Y, PADDLE_WIDTH, PADDLE_HEIGHT); 
    // 공
    ctx.beginPath();
    ctx.arc(s.ballX, s.ballY, 10, 0, Math.PI * 2);
    ctx.fill();

    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div style={{ position: 'relative', width: GAME_WIDTH, margin: '0 auto' }}>
      {/* 플레이어 이름 및 점수 UI 레이어 */}
      <div style={{
        position: 'absolute',
        top: '30px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 100px',
        color: '#fff',
        fontSize: '40px', // 점수 가독성을 위해 키움
        fontWeight: 'bold',
        fontFamily: '"Press Start 2P", monospace', // 게임 느낌 폰트 (없으면 monospace)
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}>
        {/* 왼쪽: Player 1 (Me) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px', textTransform: 'uppercase' }}>
            {meName}
          </div>
          <div>{data?.score1 ?? 0}</div>
        </div>

        {/* 오른쪽: Player 2 (Opponent) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', opacity: 0.6, marginBottom: '8px', textTransform: 'uppercase' }}>
            {opponentName}
          </div>
          <div>{data?.score2 ?? 0}</div>
        </div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={GAME_WIDTH} 
        height={GAME_HEIGHT} 
        style={{ border: '4px solid #fff', display: 'block' }}
      />
    </div>
  );
}
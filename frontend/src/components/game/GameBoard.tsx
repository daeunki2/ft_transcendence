/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameBoard.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/12 09:49:50 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/12 11:54:58 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;

export default function GameBoard({ data }: { data: GameState | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0); // 애니메이션 ID 저장용
  const stateRef = useRef<GameState | null>(null);

 useEffect(() => {
    stateRef.current = data;
  }, [data]);

  // 렌더링 루프
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = stateRef.current;

    // 배경 칠하기
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 데이터가 아직 안 들어왔다면 여기서 멈추거나 대기 화면을 그림
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

    // 패들 & 공 그리기 (하얀색)
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

    // 다음 프레임 요청
    requestRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    // 루프 시작
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // 컴포넌트 마운트 시 딱 한 번 루프 실행

  return (
    <canvas 
      ref={canvasRef} 
      width={GAME_WIDTH} 
      height={GAME_HEIGHT} 
      style={{ border: '4px solid #fff', display: 'block' }}
    />
  );
}

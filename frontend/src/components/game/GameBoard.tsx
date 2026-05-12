/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   gameBoard.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/12 09:49:50 by chanypar          #+#    #+#             */
/*   Updated: 2026/05/12 10:06:22 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useEffect, useRef } from 'react';

const GAME_WIDTH = 1000;
const GAME_HEIGHT = 600;

export default function GameBoard({ socket }: { socket: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0); // 애니메이션 ID 저장용
  
  const latestState = useRef({
    ballX: GAME_WIDTH / 2,
    ballY: GAME_HEIGHT / 2,
    p1Y: 250,
    p2Y: 250,
    score1: 0,
    score2: 0
  });

  // 1. 소켓 이벤트 리스너 (테스트 중엔 작동 안 해도 무관)
  useEffect(() => {
    if (socket) {
      const handleState = (state: any) => {
        latestState.current = state;
      };
      socket.on('game_state', handleState);
      return () => { socket.off('game_state', handleState); };
    }
  }, [socket]);

  // 2. 실제 렌더링 루프 (이게 핵심)
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s = latestState.current;

    // 배경 칠하기
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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
    ctx.fillRect(20, s.p1Y, 15, 100); 
    // 오른쪽 패들
    ctx.fillRect(GAME_WIDTH - 35, s.p2Y, 15, 100); 
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

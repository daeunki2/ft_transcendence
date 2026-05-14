/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game-engine.constants.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/13 21:16:11 by daeunki2          #+#    #+#             */
/*   Updated: 2026/05/14 19:50:03 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ===== 소켓 이벤트명 (회의 합의안 고정) =====
export const GAME_JOIN_QUEUE_EVENT = 'join_queue';
export const GAME_MOVE_PADDLE_EVENT = 'move_paddle';
export const GAME_STATE_EVENT = 'game_state';
export const GAME_OVER_EVENT = 'game_over';

// 프론트 캔버스와 서버 좌표 계산이 공유하는 게임판 크기
export const BOARD_WIDTH = 1000;
export const BOARD_HEIGHT = 600;

// 패들 크기
// 패들 상단 좌표는 p1Y, p2Y
// 패들 하단 좌표는 (p1Y + PADDLE_HEIGHT), (p2Y + PADDLE_HEIGHT)
export const PADDLE_WIDTH = 15;
export const PADDLE_HEIGHT = 100;

// 벽과 패들 사이의 거리. 왼쪽 패들은 x=20, 오른쪽 패들은 BOARD_WIDTH - 20 - PADDLE_WIDTH.
export const PADDLE_MARGIN = 20;
export const PADDLE_SPEED = 10;

// 공 좌표는 중심점 기준. 프론트 canvas arc(x, y, radius, ...)와 맞춘다.
// 왼쪽 패들 오른쪽 끝은 x=35이고 공 반지름이 10이므로, 왼쪽 충돌 순간 공 중심 x는 45.
export const BALL_RADIUS = 10;
// 지름 값. 충돌 계산에서 공의 전체 크기가 필요할 때 사용한다.
export const BALL_SIZE = BALL_RADIUS * 2;
// 공이 처음 시작/리셋될 때의 기본 속도
export const INITIAL_BALL_SPEED_X = 7;
export const INITIAL_BALL_SPEED_Y = 4;

// 이 점수에 먼저 도달한 플레이어가 승리
export const WIN_SCORE = 5;

/*
왼쪽 벽 x = 0
오른쪽으로 갈수록 x 증가
왼쪽 패들 x = 20
패들 폭 = 15
패들 오른쪽 끝 = 35
공 반지름 = 10
공 중심 x = 35 + 10 = 45
*/

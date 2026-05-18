import { Injectable } from '@nestjs/common';
import type { AiDecisionContext, AiDifficulty } from './ai-match.types';
import { PADDLE_HEIGHT, PADDLE_SPEED } from './game-engine.constants';

@Injectable()
export class AiBotService {
  // 우선 단일 난이도(normal) 기준으로 공의 y를 추적해 p2 패들 방향을 결정한다.
  decideDirection(
    context: AiDecisionContext,
    difficulty: AiDifficulty = 'normal',
  ): 'up' | 'down' | 'none' {
    const { state, paddleY } = context;
    const paddleCenterY = paddleY + PADDLE_HEIGHT / 2;
    const targetY = state.ballY;

    // 목표와 패들 중심 차이가 너무 작으면 떨림을 줄이기 위해 정지한다.
    const deadZone = difficulty === 'normal' ? PADDLE_SPEED * 0.7 : PADDLE_SPEED * 0.7;
    if (Math.abs(targetY - paddleCenterY) <= deadZone) {
      return 'none';
    }

    return targetY < paddleCenterY ? 'up' : 'down';
  }
}


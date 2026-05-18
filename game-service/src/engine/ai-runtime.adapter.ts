import { Injectable } from '@nestjs/common';
import { AiBotService } from './ai-bot.service';
import { GameEngineService } from './game-engine.service';
import type { EngineState } from './game-engine.types';

@Injectable()
export class AiRuntimeAdapter {
  constructor(
    private readonly aiBot: AiBotService,
    private readonly engine: GameEngineService,
  ) {}

  // 현재 세션이 AI 상대인 경우 p2 패들 입력을 자동으로 1틱 적용한다.
  applyAiInputIfNeeded(
    state: EngineState,
    p2UserId: string,
  ): EngineState {
    if (!this.isAiUser(p2UserId)) {
      return state;
    }

    const direction = this.aiBot.decideDirection({
      state,
      paddleY: state.p2Y,
    });
    if (direction === 'none') {
      return state;
    }
    return this.engine.movePaddle(state, 'p2', direction);
  }
  // 게이트웨이에서 생성한 AI 유저 식별 규칙(AI_BOT_ prefix)에 맞춰 AI 세션 여부를 판정한다.
  private isAiUser(userId: string): boolean {
    return userId.startsWith('AI_BOT_');
  }
}


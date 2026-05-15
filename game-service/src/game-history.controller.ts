/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game-history.controller.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/05/14 20:53:39 by daeunki2          #+#    #+#             */
/*   Updated: 2026/05/14 20:53:40 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Controller, Get, Param } from '@nestjs/common';
import { GameHistoryService } from './game-history.service';

@Controller('games')
export class GameHistoryController {
  constructor(private readonly gameHistoryService: GameHistoryService) {}

  @Get('history/:userId')
  async getHistory(@Param('userId') userId: string) {
    return this.gameHistoryService.getHistoryByUserId(userId);
  }
}

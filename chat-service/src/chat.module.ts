/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.module.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 18:50:39 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/29 18:50:40 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatRepository } from './repository/chat.repository';
import { ChatMessage } from './entities/chat.entity'; // 엔티티 경로 확인!

@Module({
  imports: [
    // 1. 엔티티를 TypeORM에 등록
    TypeOrmModule.forFeature([ChatMessage])
  ],
  providers: [
    ChatGateway, 
    ChatService, 
    ChatRepository // 2. 리포지토리를 프로바이더로 등록
  ],
})
export class ChatModule {}
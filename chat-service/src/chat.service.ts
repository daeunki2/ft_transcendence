/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 18:45:39 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/29 18:58:40 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nest-modules/ioredis'; // 환경에 따라 다를 수 있음
import { ChatRepository } from './entity/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly redis: Redis,
    private readonly chatRepo: ChatRepository,
  ) {}

  /**
   * 메시지를 DB에 저장합니다. (수신자가 오프라인이어도 데이터 보존)
   */
  async processMessage(from: string, to: string, message: string) {
    try {
      // 1. DB 저장 (Repository 호출)
      const chatLog = await this.chatRepo.saveMessage({
        senderId: from,
        receiverId: to,
        content: message,
        isRead: false,
      });

      console.log(`[Service] 메시지 DB 저장 성공 (ID: ${chatLog.id})`);
      return chatLog;
    } catch (error) {
      console.error(`[Service Error] DB 저장 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 유저가 온라인일 때 소켓 ID를 Redis에 기록합니다.
   */
  async setUserOnline(userId: string, socketId: string) {
    try {
      // 키 형식: user:socket:{userId}, 값: {socketId}, 유효시간: 24시간
      await this.redis.set(`user:socket:${userId}`, socketId, 'EX', 86400);
      console.log(`[Redis] 유저 ${userId} 상태 저장 (Socket: ${socketId})`);
    } catch (error) {
      console.error(`[Redis Error] setUserOnline 실패: ${error.message}`);
    }
  }

  /**
   * 유저 접속 종료 시 Redis에서 정보를 삭제합니다.
   */
  async setUserOffline(userId: string) {
    try {
      await this.redis.del(`user:socket:${userId}`);
      console.log(`[Redis] 유저 ${userId} 상태 삭제 완료`);
    } catch (error) {
      console.error(`[Redis Error] setUserOffline 실패: ${error.message}`);
    }
  }

  /**
   * 수신자의 소켓 ID를 Redis에서 조회합니다.
   */
  async getUserSocketId(userId: string): Promise<string | null> {
    try {
      const socketId = await this.redis.get(`user:socket:${userId}`);
      return socketId;
    } catch (error) {
      console.error(`[Redis Error] 소켓 ID 조회 실패: ${error.message}`);
      return null;
    }
  }

  /**
 * 나와 상대방 사이의 모든 대화 내역을 조회합니다.
 */
  async getDmHistory(myId: string, targetId: string) {
    try {
      console.log(`[Service] History 조회 요청: ${myId} <-> ${targetId}`);
      return await this.chatRepo.findDmHistory(myId, targetId);
    } catch (error) {
      console.error(`[Service Error] History 조회 중 실패: ${error.message}`);
      return [];
    }
  }
}
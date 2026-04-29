/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.gateway.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 19:06:54 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/29 19:06:55 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { SendDmDto, GetHistoryDto } from './dto/message.dto'; // DTO 임포트

@WebSocketGateway({ namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  private extractUserId(client: Socket): string | null {
    const userId = client.handshake.headers['x-user-id'];
    if (!userId || Array.isArray(userId) || userId.trim() === '') {
      return null;
    }
    return userId;
  }

  async handleConnection(client: Socket) {
    try {
      const userId = this.extractUserId(client);
      if (!userId) {
        console.error(`[Chat] 인증 헤더 누락: 접속 거부 (ID: ${client.id})`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      await this.chatService.setUserOnline(userId, client.id);
      console.log(`[Chat] 유저 온라인: ${userId}`);
    } catch (error: any) {
      console.error(`[Chat] 연결 처리 중 예외 발생: ${error.message}`);
      client.disconnect();
    }
  }

  @SubscribeMessage('send_dm')
  async handleDM(client: Socket, payload: SendDmDto) { // DTO 적용
    const from = client.data.userId;
    const { to, message } = payload;

    if (!from) {
      console.error(`[DM Error] 인증되지 않은 송신자 접근`);
      client.emit('error', { message: '인증 정보가 없습니다.' });
      return;
    }

    try {
      console.log(`[DM Request] From: ${from} -> To: ${to}`);
      const chatLog = await this.chatService.processMessage(from, to, message);

      const targetSocketId = await this.chatService.getUserSocketId(to);
      if (targetSocketId) {
        this.server.to(targetSocketId).emit('new_dm', chatLog);
        console.log(`[Real-time Push] Sent to ${to}`);
      }

      client.emit('send_success', { messageId: chatLog.id });
    } catch (err: any) {
      console.error(`[DM Process Error] ${err.message}`);
      client.emit('error', { message: '메시지 전송 실패' });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      try {
        await this.chatService.setUserOffline(userId);
        console.log(`[Disconnected] User: ${userId}`);
      } catch (err: any) {
        console.error(`[Redis Error] 오프라인 상태 변경 실패: ${err.message}`);
      }
    }
  }

  @SubscribeMessage('get_history')
  async handleGetHistory(client: Socket, payload: GetHistoryDto) { // DTO 적용
    const userId = client.data.userId;
    if (!userId) return;

    try {
      console.log(`[History Request] ${userId} <-> ${payload.targetId}`);
      const history = await this.chatService.getDmHistory(userId, payload.targetId);
      client.emit('history_res', history);
    } catch (err: any) {
      console.error(`[History Error] ${err.message}`);
      client.emit('error', { message: '대화 내역을 불러올 수 없습니다.' });
    }
  }
}
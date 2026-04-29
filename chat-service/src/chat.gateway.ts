/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.gateway.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 18:29:14 by chanypar          #+#    #+#             */
/*   Updated: 2026/04/29 18:36:06 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { WebSocketGateway,
		 OnGatewayConnection,
		 SubscribeMessage,
		 WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway implements OnGatewayConnection {
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
    // Gateway에서 프록시할 때 헤더나 query에 넣어준 userId를 추출
    // 보통 Gateway-to-Service 통신 시 handshake.headers를 사용합니다.
    const userId = this.extractUserId(client);

    if (!userId) {
      console.error('인증되지 않은 연결 시도');
      return client.disconnect();
    }

    // 소켓 객체에 userId 보관 (이후 모든 이벤트에서 사용)
    client.data.userId = userId;

    // 실시간 푸시를 위해 Redis에 "이 유저의 소켓은 이 서버에 있다"고 등록
    await this.chatService.setUserOnline(userId, client.id);
  }

  @SubscribeMessage('send_dm')
  async handleDM(client: Socket, payload: { to: string; message: string }) {
    const from = client.data.userId; // 이미 검증된 userId
    const { to, message } = payload;

    // 1. DB 저장 (수신자 오프라인 대비)
    const chatLog = await this.chatService.processMessage(from, to, message);

    // 2. 수신자 실시간 접속 여부 확인 (Redis 조회)
    const targetSocketId = await this.chatService.getUserSocketId(to);

    if (targetSocketId) {
      // 온라인이면 즉시 푸시
      this.server.to(targetSocketId).emit('new_dm', chatLog);
    }
  }

  async handleDisconnect(client: Socket) {
    if (client.data.userId) {
      await this.chatService.setUserOffline(client.data.userId);
    }
  }
}
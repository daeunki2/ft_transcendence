// src/friends/friends.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FriendsService } from './friends.service';

interface SendRequestDto {
  nickname?: unknown;
}

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  // TODO: JwtAuthGuard 도입 시 이 헬퍼를 req.user.id로 교체
  // 임시: x-user-id 헤더에서 현재 사용자 id를 꺼낸다
  private getCurrentUserId(req: Request): number {
    const raw = req.headers['x-user-id'];
    if (!raw || Array.isArray(raw)) {
      throw new UnauthorizedException('x-user-id header required (temp)');
    }
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      throw new UnauthorizedException('x-user-id header is invalid');
    }
    return id;
  }

  // 내 친구 목록
  @Get()
  async getFriends(@Req() req: Request) {
    const userId = this.getCurrentUserId(req);
    return this.friendsService.getFriends(userId);
  }

  // 내가 받은 친구 요청 목록
  @Get('requests')
  async getRequests(@Req() req: Request) {
    const userId = this.getCurrentUserId(req);
    return this.friendsService.getReceivedRequests(userId);
  }

  // 친구 요청 보내기
  @Post('requests')
  async sendRequest(@Req() req: Request, @Body() body: SendRequestDto) {
    const userId = this.getCurrentUserId(req);
    if (typeof body?.nickname !== 'string' || body.nickname.trim() === '') {
      throw new BadRequestException('NICKNAME_REQUIRED');
    }
    return this.friendsService.sendRequest(userId, body.nickname.trim());
  }

  // 친구 요청 수락
  @Patch('requests/:id')
  async acceptRequest(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = this.getCurrentUserId(req);
    return this.friendsService.acceptRequest(userId, id);
  }

  // 친구 요청 거절
  @Delete('requests/:id')
  async rejectRequest(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = this.getCurrentUserId(req);
    await this.friendsService.rejectRequest(userId, id);
    return { success: true };
  }

  // 친구 삭제
  @Delete(':id')
  async removeFriend(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const userId = this.getCurrentUserId(req);
    await this.friendsService.removeFriend(userId, id);
    return { success: true };
  }
}

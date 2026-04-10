import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import * as express from 'express';


@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('init') // auth-service가 호출하는 경로

  async initializeUser(@Body() data: { id: string; email: string; nickname: string }) {
    return await this.userService.createUserProfile(data.id, data.email, data.nickname);
  }

  @Get('me')
  	async getMe(@Req() request: express.Request) {
    console.log('[getMe] 입장');
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('[getMe] 로그인이 필요합니다.');
    }
	
    const user = await this.userService.getMe(token);

    if (!user) {
  // 유저가 없을 경우 예외를 던짐 (NestJS 표준 방식)
    throw new NotFoundException('[getMe] 유저를 찾을 수 없습니다.');
    }
    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        userPhoto: user.userPhoto,
      },
    };
  }
	
}

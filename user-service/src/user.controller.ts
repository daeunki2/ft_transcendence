import { Controller, Post, Body, Res, Get, Req, Patch, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import * as express from 'express';


@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('init') // auth-service가 호출하는 경로

  async initializeUser(@Body() data: { id: string; email: string; nickname: string }) {
    const user = await this.userService.createUserProfile(data.id, data.email, data.nickname);
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

  @Get('me')
  	async getMe(@Req() request: express.Request) {
    // console.log('[getMe] 입장');
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

  @Patch('me')
  async updateProfile(
    @Req() request: express.Request,
    @Body() data: { userPhoto?: number; nickname?: string }
  ) {
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('[updateProfile] 로그인이 필요합니다.');
    }

    // 서비스 호출 (비즈니스 로직 위임)
    const updatedUser = await this.userService.updateProfile(token, data);

    if (!updatedUser) {
      throw new NotFoundException('[updateProfile] 유저를 찾을 수 없습니다.');
    }

    return {
      success: true,
      user: {
        userId: updatedUser.userId,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        userPhoto: updatedUser.userPhoto,
      },
    };
  }
}

import { Controller, Post, Body, Res, Get, Req, Patch, UnauthorizedException, NotFoundException, Headers } from '@nestjs/common';
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
  async getMe(@Headers('x-user-id') currentUserId?: string) {
    if (!currentUserId) {
      throw new UnauthorizedException('[getMe] 인증 정보가 없습니다.');
    }

    const user = await this.userService.getMe(currentUserId);

    if (!user) {
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

  /*
  //쿠키에서 Access Token을 읽어 직접 검증
  @Get('me')
	async getMe(@Req() request: express.Request) {
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('[getMe] 로그인이 필요합니다.');
    }
	
    const user = await this.userService.getMe(token);

    if (!user) {
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
  */

  @Patch('me')
  async updateProfile(
    @Headers('x-user-id') currentUserId: string | undefined,
    @Body() data: { userPhoto?: number; nickname?: string }
  ) {
    if (!currentUserId) {
      throw new UnauthorizedException('[updateProfile] 인증 정보가 없습니다.');
    }

    const updatedUser = await this.userService.updateProfile(currentUserId, data);

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

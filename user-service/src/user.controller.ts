import { Controller, Post, Body, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
// import * as express from 'express';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('init') // auth-service가 호출하는 경로

  async initializeUser(@Body() data: { id: string; email: string; nickname: string }) {
    return await this.userService.createUserProfile(data.id, data.email, data.nickname);
  }

  // @Get('me')
  // 	async getMe(@Req() request: express.Request) {
  //   const token = request.cookies['accessToken'];

  //   if (!token) {
  //     throw new UnauthorizedException('로그인이 필요합니다.');
  //   }
	
  //   const user = await this.authService.getMe(token);
  //   return {
  //     success: true,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //     },
  //   };
  // }
	
}

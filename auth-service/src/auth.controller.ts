import { Controller, Post, Body, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';
import type { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

	@Post('login')
  		async login(@Body() loginData: any, @Res({ passthrough: true }) response: Response) {
    	console.log('[login]프론트에서 온 데이터:', loginData);	
		const result = await this.authService.login(loginData);

		
		response.cookie('accessToken', result.accessToken, {
    	httpOnly: true,  // 자바스크립트가 접근 못하게 막음 (해킹 방지)
    	secure: false,   // HTTPS가 아닐 때도 허용 (개발용)
    	maxAge: 3600000, // 1시간
  		});
		return (result); 
	}
	@Post('signup')
		async signUp(@Body() userData: any) {
    	console.log('[signup]프론트에서 온 데이터:', userData);
		return await this.authService.signUp(userData);
	}

	@Post('logout')
  		async logout(@Res({ passthrough: true }) response: Response) {
    // 1. 서비스 로직 실행 (필요한 경우 DB 상태 변경 등)
    	const result = await this.authService.logout();

    // 2. 쿠키 삭제 (만료 시간을 아주 과거인 0으로 설정)
    	response.cookie('accessToken', '', {
      	httpOnly: true,
      	secure: false,   // 실서비스(HTTPS)라면 true
      	expires: new Date(0), // 즉시 삭제
		path: '/',
    	});

    	return (result);
  	}

	@Get('me')
  	async getMe(@Req() request: express.Request) {
    const token = request.cookies['accessToken'];

    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }
	
    const user = await this.authService.getMe(token);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}

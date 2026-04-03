import { Controller, Post, Body, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

	@Post('login')
  		async login(@Body() loginData: any, @Res({ passthrough: true }) response: Response) {
    	console.log('프론트에서 온 데이터:', loginData);	
		const result = await this.appService.login(loginData);

		
		response.cookie('accessToken', result.accessToken, {
    	httpOnly: true,  // 자바스크립트가 접근 못하게 막음 (해킹 방지)
    	secure: false,   // HTTPS가 아닐 때도 허용 (개발용)
    	maxAge: 3600000, // 1시간
  });
		return (result); 
	}
	@Post('signup')
		async signUp(@Body() userData: any) {
    	console.log('프론트에서 온 데이터:', userData);
		return await this.appService.signUp(userData);
	}
}

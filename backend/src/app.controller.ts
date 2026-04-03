import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

	@Post('login')
  		async login(@Body() loginData: any) {
    	console.log('프론트에서 온 데이터:', loginData);
		return await this.appService.validateUser(loginData);
	}
	@Post('signup')
		async signUp(@Body() userData: any) {
    	console.log('프론트에서 온 데이터:', userData);
		return await this.appService.signUp(userData);
	}
}

import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as express from 'express';
import type { CookieOptions, Response } from 'express';

@Controller()
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginData: any,
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('[login]프론트에서 온 데이터:', loginData);
    const result = await this.authService.login(loginData, {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    if (result.success) {
      const baseCookieOptions = this.getBaseCookieOptions();
      response.cookie('accessToken', result.accessToken, {
        ...baseCookieOptions,
        maxAge: result.accessTokenMaxAgeMs,
      });
      response.cookie('refreshToken', result.refreshToken, {
        ...baseCookieOptions,
        maxAge: result.refreshTokenMaxAgeMs,
      });
    }

    return result;
  }
	@Post('signup')
		async signUp(@Body() userData: any) {
    	console.log('[signup]프론트에서 온 데이터:', userData);
		return await this.authService.signUp(userData);
	}

  @Post('refresh')
  async refresh(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken, {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    if (result.success) {
      const baseCookieOptions = this.getBaseCookieOptions();
      response.cookie('accessToken', result.accessToken, {
        ...baseCookieOptions,
        maxAge: result.accessTokenMaxAgeMs,
      });
      response.cookie('refreshToken', result.refreshToken, {
        ...baseCookieOptions,
        maxAge: result.refreshTokenMaxAgeMs,
      });
    }

    return result;
  }

	@Post('logout')
  		async logout(
      @Req() request: express.Request,
      @Res({ passthrough: true }) response: Response,
    ) {
    // 1. 서비스 로직 실행 (필요한 경우 DB 상태 변경 등)
    	const refreshToken = request.cookies?.refreshToken;
    	const result = await this.authService.logout(refreshToken);

    // 2. 쿠키 삭제 (만료 시간을 아주 과거인 0으로 설정)
    const baseCookieOptions = this.getBaseCookieOptions();
    const expiredAt = new Date(0);
    response.cookie('accessToken', '', {
      ...baseCookieOptions,
      expires: expiredAt,
    });
    response.cookie('refreshToken', '', {
      ...baseCookieOptions,
      expires: expiredAt,
    });

    	return (result);
  	}

  private getBaseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'none',
      path: '/',
    };
  }
}

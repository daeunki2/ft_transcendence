import { Controller, Post, Get, Body, Res, Req, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import * as express from 'express';
import type { CookieOptions, Response } from 'express';

@Controller()
export class AuthController {
  private readonly isProduction = process.env.NODE_ENV === 'production';

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // 인증 검증 전용 엔드포인트.
  // user-service 의 /me 와 분리해서, 프로필이 죽어도 인증 자체는 살아있을 수 있게 한다.
  // (graceful degradation: hard dependency → soft dependency)
  @Get('me')
  me(@Req() request: express.Request) {
    const token = request.cookies?.accessToken;
    if (!token) {
      throw new HttpException(
        { success: false, message: 'ACCESS_TOKEN_REQUIRED' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      const payload = this.jwtService.verify(token);
      return {
        success: true,
        user: {
          userId: String(payload.sub ?? ''),
          id: payload.id ?? '',
        },
      };
    } catch {
      throw new HttpException(
        { success: false, message: 'ACCESS_TOKEN_INVALID' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

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
      console.log('[인증컨트롤러] 새 쿠키(access/refresh) 설정 완료');
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
  ){
    console.log('[인증컨트롤러] 리프레시 요청 수신', { hasRefreshToken: Boolean(request.cookies?.refreshToken),});

    const refreshToken = request.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken, {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    });

    console.log('[인증컨트롤러] 리프레시 처리 결과', { success: result.success, message: result.message,});


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

  // 게스트 토큰 발급. 일반 로그인과 달리 refresh token 은 굽지 않는다(쿠키 안 세팅).
  // 만료되면 프론트가 다시 이 엔드포인트를 호출해 새 게스트로 진입.
  @Post('guest')
  guest(@Res({ passthrough: true }) response: Response) {
    const result = this.authService.guest();

    const baseCookieOptions = this.getBaseCookieOptions();
    response.cookie('accessToken', result.accessToken, {
      ...baseCookieOptions,
      maxAge: result.accessTokenMaxAgeMs,
    });
    console.log('[게스트컨트롤러] 게스트 access token 쿠키 설정 완료');

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
      sameSite: 'lax',
      path: '/',
    };
  }
}

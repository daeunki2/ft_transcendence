/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/15 14:02:33 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/15 16:33:18 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { JwtService } from '@nestjs/jwt'; // 토큰검증
import cookieParser from 'cookie-parser'; // 쿠키접근
import type { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS 설정 (프론트엔드 허용)
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  const jwtService = app.get(JwtService);

  // 2. Auth Service로 토스 (주소가 /auth로 시작하면 4000번으로)
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://auth-service:4000',
      changeOrigin: true,
      pathRewrite: { '^/api/auth': '' },
      // 개발 환경에서는 auth-service 컨테이너의 도메인을 그대로 쓰면
      // 브라우저가 쿠키를 저장하지 못하므로 localhost로 재작성한다.
      cookieDomainRewrite: {
        '*': 'localhost',
      },
      on: {
        proxyRes(proxyRes) {
          const cookies = proxyRes.headers['set-cookie'];
          if (!cookies) {
            return;
          }
          const cookieList = Array.isArray(cookies) ? cookies : [cookies];
          proxyRes.headers['set-cookie'] = cookieList.map((cookie) => {
            // dev 환경에서는 HTTPS가 아니므로 Secure 플래그를 제거해 쿠키 저장을 허용한다.
            let updated = cookie.replace(/;\s*secure/gi, '');
            // SameSite=None은 Secure 플래그와 함께 써야 하므로, Secure를 뗀 경우 Lax로 강제 변환한다.
            if (/;\s*samesite=none/gi.test(updated)) {
              updated = updated.replace(/;\s*samesite=none/gi, '; SameSite=Lax');
            } // 개발환경이라 어쩔 수 없음. 나중에 수정해야할 수 있음. 
            return updated;
          });
        },
      },
    }),
  );

  // 다른 서비스로 가기 전에 일단 at토큰 검사 
  const verifyAccessToken = createAccessTokenMiddleware(jwtService);

  // 3. User Service로 토스 (주소가 /users로 시작하면 4001번으로)
  app.use(
    '/api/users',
    verifyAccessToken,
    createProxyMiddleware({
      target: 'http://user-service:4001',
      changeOrigin: true,
	  pathRewrite: { '^/api/users': '' },
      // user-service 다운 시 502 대신 표준 503 + 코드로 응답 (프론트 헬스 가드와 연결)
      on: {
        error(_err, _req, res) {
          const response = res as Response;
          if (response.headersSent) {
            return;
          }
          response.status(503).json({
            success: false,
            message: 'USER_SERVICE_UNAVAILABLE',
          });
        },
      },
    }),
  );

  await app.listen(8000);
  console.log('API Gateway is running on http://localhost:8000');
}
bootstrap();

function createAccessTokenMiddleware(jwtService: JwtService) // 인증로직 
{
  return (req: Request, res: Response, next: NextFunction) =>
  {
    if (req.method === 'OPTIONS')
    {
      return next();
    }
    const token = req.cookies?.accessToken;

  console.log('[게이트웨이] 액세스 토큰 검사 시작', { path: req.path,hasAccessToken: Boolean(req.cookies?.accessToken), });

    
    if (!token)
    {
      console.log('[게이트웨이] 액세스 토큰 없음 -> ACCESS_TOKEN_REQUIRED 반환');
      return res.status(401).json({
        success: false,
        message: 'ACCESS_TOKEN_REQUIRED',
      });
    } // 토큰이 완전히 없는 경우 error
    try
    {
      const payload = jwtService.verify(token);
      req.headers['x-user-id'] = String(payload.sub ?? '');

      console.log('[게이트웨이] 액세스 토큰 검증 성공', { sub: payload.sub });
      
      if (payload.id) {
        req.headers['x-user-login-id'] = payload.id as string;
      }
      return next();
    }
    catch (error)
    {
      console.log('[게이트웨이] 액세스 토큰 검증 실패 -> ACCESS_TOKEN_INVALID');
      return res.status(401).json({
        success: false,
        message: 'ACCESS_TOKEN_INVALID',
      }); // 만료된 경우. 게이트웨이는 된거만 체크함. 재발급은 인증서비스에서 진행.
    } // 만료된 쿠키도 삭제되기 때문에 현재는 필요 없으나 나중을 위해 남겨둠 
  };
}

/*
로그인 상태에서 API 요청
게이트웨이 AT 검증
만료/무효면 401
프론트가 /api/auth/refresh 호출
auth-service가 RT 검증 후:
성공: 새 AT/RT 쿠키 발급(회전/블랙리스트 포함), 원요청 재시도
실패: 재로그인 유도
*/

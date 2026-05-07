import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RefreshSession } from './entities/refresh-session.entity';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis/redis.module';
import { isNicknameAllowed } from './utils/nickname-filter'; // 금칙어

const idRegex = /^[A-Za-z0-9]{1,20}$/;       // 1~20자, 영어+숫자 아이디로 <script>alert("해킹")</script> 이런거 넣는거 방지
const passwordRegex = /^[A-Za-z0-9]{4,32}$/;   // 4~32자, 영어+숫자 
const nicknameRegex = /^[A-Za-z0-9]{1,20}$/;

type LoginContext = {
  userAgent?: string;
  ipAddress?: string;
};

type LoginResult =
  | {
      success: true;
      message: string;
      accessToken: string;
      refreshToken: string;
      accessTokenMaxAgeMs: number;
      refreshTokenMaxAgeMs: number;
      user: { id: string };
    }
  | {
      success: false;
      message: string;
    };

@Injectable()
export class AuthService {
  private readonly defaultAccessTtl = '15m'; //15분
  private readonly defaultRefreshTtl = '7d'; //7일
  private readonly defaultAccessTtlMs = 15 * 60 * 1000;
  private readonly defaultRefreshTtlMs = 7 * 24 * 60 * 60 * 1000;

  constructor(
    @InjectRepository(Auth)
    private userRepository: Repository<Auth>,
    @InjectRepository(RefreshSession)
    private refreshSessionRepository: Repository<RefreshSession>,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async signUp(userData: any) {
    const { id, password, nick } = userData;

    if (!idRegex.test(id)) {
      return { success: false, message: 'INVALID_ID_FORMAT' };
    }
    if (!passwordRegex.test(password)) {
      return { success: false, message: 'INVALID_PASSWORD_FORMAT' };
    }
    if (!nicknameRegex.test(nick)) {
      return { success: false, message: 'INVALID_NICKNAME_FORMAT' };
    }

    if (typeof nick !== 'string' || nick.trim() === '' || !isNicknameAllowed(nick)) {
    return { success: false, message: 'NICKNAME_NOT_ALLOWED' };
    }

    const existingID = await this.userRepository.findOne({where: { loginId: id }})

    if (existingID)
      return { success: false, message: 'USER_ALREADY_EXISTS' };

    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.userRepository.create({
      loginId: id,
      password: hashedPassword,
    //  refresh_token: null, 테이블을 따로 두어서 이제는 필요 없음
    });
    const savedUser = await this.userRepository.save(newUser); // 인증디비에저장
		console.log(`[signUp가입 성공: ID ${savedUser.id}`);

    try {
      await firstValueFrom(
        this.httpService.post('http://user-service:4001/init', // 유저서비스 쪽에 초기화 요청 보냄. 
        {
          id: savedUser.id,
          loginId: id,
          nickname: nick,
        }),
      );
    } catch (error: any) {
      // user-service init이 실패하면 auth 레코드를 롤백해 데이터 불일치를 방지
      await this.userRepository.delete({ id: savedUser.id });
      const upstreamMessage = error.response?.data?.message;
      console.error(
        '[signUp]User 서비스 초기화 실패:',
        error.response?.data || error.message,
      );
      if (typeof upstreamMessage === 'string' && upstreamMessage.length > 0) {
        return { success: false, message: upstreamMessage };
      }
      return { success: false, message: 'USER_PROFILE_INIT_FAILED' };
    }
	  return { success: true, message: 'SIGNUP_SUCCESS' };
  }

  async login(loginData: any, context?: LoginContext): Promise<LoginResult> {
    const { id, password } = loginData;

    if (!idRegex.test(id)) {
      return { success: false, message: 'INVALID_ID_FORMAT' };
    }
    if (!passwordRegex.test(password)) {
      return { success: false, message: 'INVALID_PASSWORD_FORMAT' };
    }

    const user = await this.userRepository.findOne({ where: { loginId: id } });
  
    if (!user)
      return { success: false, message: 'USER_NOT_FOUND' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // 동시 로그인 경쟁 조건 방지: 짧은 TTL의 사용자별 로그인 락
      const loginLockKey = `presence:login-lock:${user.id}`;
      const loginLockTtlSec = 15;
      const lockResult = await this.redis.set(loginLockKey, '1', 'EX', loginLockTtlSec, 'NX');
      if (lockResult !== 'OK') {
        return { success: false, message: 'ALREADY_ONLINE' };
      }

      let releaseLoginLock = true;
      try {
      // 상태 기반 제한: 이미 ONLINE 상태면 중복 로그인 차단
      const effectiveState =
        (await this.redis.get(`presence:effective:${user.id}`)) ?? 'OFFLINE';
      if (effectiveState !== 'OFFLINE') {
        return { success: false, message: 'ALREADY_ONLINE' };
      }

      const payload = { sub: user.id, id: user.loginId }; // 토큰안에 들어갈 식별자
      const accessTtl = this.getAccessTokenTtl();
      const refreshTtl = this.getRefreshTokenTtl();
      const accessTokenMaxAgeMs = this.parseTtlToMs(accessTtl, this.defaultAccessTtlMs);
      const refreshTokenMaxAgeMs = this.parseTtlToMs(refreshTtl, this.defaultRefreshTtlMs);

      const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenMaxAgeMs / 1000 });// 실제 토큰 생성
      console.log('at 토큰 발급 성공');
      const refreshToken = this.jwtService.sign(payload, { expiresIn:refreshTokenMaxAgeMs / 1000 });
      console.log('re 토큰 발급 성공');

      await this.refreshSessionRepository.save({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        userAgent: context?.userAgent ?? null,
        ipAddress: context?.ipAddress ?? null,
        expiresAt: new Date(Date.now() + refreshTokenMaxAgeMs),
      });
      console.log('re 토큰 저장');

      console.log('[login]로그인 성공');

      // 성공 시에는 락을 즉시 지우지 않고 TTL로만 유지해
      // 소켓 connected 이벤트 반영 전 짧은 레이스 구간을 줄인다.
      releaseLoginLock = false;

      return {
        success: true,
        message: 'LOGIN_SUCCESS',
        accessToken,
        refreshToken,
        accessTokenMaxAgeMs,
        refreshTokenMaxAgeMs,
        user: {
          id: user.loginId,
        },
      };
      } finally {
        if (releaseLoginLock) {
          await this.redis.del(loginLockKey);
        }
      }
    }
    // 실패 시
    return { success: false, message: 'INVALID_PASSWORD' };
  }

  async refresh(refreshToken?: string, context?: LoginContext): Promise<LoginResult> {
    console.log('[인증서비스] refresh 시작');
    if (!refreshToken) {
      console.log('[인증서비스] 리프레시 토큰 없음');
      return { success: false, message: 'REFRESH_TOKEN_REQUIRED' };
    }

    const revoked = await this.isRefreshTokenBlacklisted(refreshToken);
    console.log('[인증서비스] 블랙리스트 조회 완료', { revoked });
    if (revoked) {
      console.log('[인증서비스] 블랙리스트에 등록된 토큰');
      return { success: false, message: 'REFRESH_TOKEN_REVOKED' };
    }

    try {
      this.jwtService.verify<{ sub: string; id?: string }>(refreshToken);
      console.log('[인증서비스] 리프레시 토큰 서명 검증 성공');
    } catch (error) {
      console.log('[인증서비스] 리프레시 토큰 서명 검증 실패');
      return { success: false, message: 'REFRESH_TOKEN_INVALID' };
    }

    const tokenHash = this.hashToken(refreshToken);
    const session = await this.refreshSessionRepository.findOne({
      where: { tokenHash },
    });

    if (!session) {
      console.log('[인증서비스] 리프레시 세션 없음');
      return { success: false, message: 'REFRESH_SESSION_NOT_FOUND' };
    }

    if (session.expiresAt.getTime() < Date.now()) {
      console.log('[인증서비스] 리프레시 세션 만료');
      await this.refreshSessionRepository.delete({ tokenHash });
      return { success: false, message: 'REFRESH_TOKEN_EXPIRED' };
    }

    const user = await this.userRepository.findOne({
      where: { id: session.userId },
    });
    if (!user) {
      await this.refreshSessionRepository.delete({ tokenHash });
      return { success: false, message: 'USER_NOT_FOUND' };
    }

    const accessTtl = this.getAccessTokenTtl();
    const refreshTtl = this.getRefreshTokenTtl();
    const accessTokenMaxAgeMs = this.parseTtlToMs(accessTtl, this.defaultAccessTtlMs);
    const refreshTokenMaxAgeMs = this.parseTtlToMs(refreshTtl, this.defaultRefreshTtlMs);

    const newAccessToken = this.jwtService.sign(
      { sub: user.id, id: user.loginId },
      { expiresIn: accessTokenMaxAgeMs / 1000 },
    );
    const newRefreshToken = this.jwtService.sign(
      { sub: user.id, id: user.loginId },
      { expiresIn: refreshTokenMaxAgeMs / 1000 },
    );
    console.log('[인증서비스] 새 액세스/리프레시 토큰 발급 완료');

    const previousExpiryMs = session.expiresAt.getTime();
    session.tokenHash = this.hashToken(newRefreshToken);
    session.userAgent = context?.userAgent ?? null;
    session.ipAddress = context?.ipAddress ?? null;
    session.expiresAt = new Date(Date.now() + refreshTokenMaxAgeMs);
    await this.refreshSessionRepository.save(session);
    await this.addRefreshTokenToBlacklist(refreshToken, previousExpiryMs - Date.now());
    console.log('[인증서비스] 리프레시 세션 갱신 및 기존 RT 블랙리스트 등록 완료');

    return {
      success: true,
      message: 'REFRESH_SUCCESS',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenMaxAgeMs,
      refreshTokenMaxAgeMs,
      user: {
        id: user.loginId,
      },
    };
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      console.log('[logout]refreshToken 없음');
      return {
        success: true,
        message: 'LOGOUT_NO_REFRESH_TOKEN',
      };
    }

    const tokenHash = this.hashToken(refreshToken);
    await this.refreshSessionRepository.delete({ tokenHash });
    await this.addRefreshTokenToBlacklist(refreshToken);

    console.log('[logout]로그아웃 성공');
    return {
      success: true,
      message: 'LOGOUT_SUCCESS',
    };
  }

  private getAccessTokenTtl(): string {
    return this.configService.get<string>('ACCESS_TOKEN_TTL') ?? this.defaultAccessTtl;
  }

  private getRefreshTokenTtl(): string {
    return this.configService.get<string>('REFRESH_TOKEN_TTL') ?? this.defaultRefreshTtl;
  }

  private parseTtlToMs(ttl: string, fallback: number): number {
    if (!ttl) return fallback;
    const trimmed = ttl.trim();
    const numericValue = Number(trimmed);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }

    const match = trimmed.match(/^(\d+)([smhd])$/i);
    if (!match) {
      return fallback;
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const unitMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (unitMap[unit] ?? 1000);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getBlacklistKey(hash: string) {
    return `refresh_blacklist:${hash}`;
  }

  private async isRefreshTokenBlacklisted(token: string) {
    const hash = this.hashToken(token);
    const exists = await this.redis.exists(this.getBlacklistKey(hash));
    return exists === 1;
  }

  private async addRefreshTokenToBlacklist(token: string, ttlMs?: number) {
    const hash = this.hashToken(token);
    const key = this.getBlacklistKey(hash);
    const ttl = ttlMs && ttlMs > 0 ? ttlMs : this.defaultRefreshTtlMs;
    await this.redis.set(key, '1', 'PX', ttl);
  }
}

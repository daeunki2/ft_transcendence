import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private userRepository: Repository<Auth>,
	  private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async signUp(userData: any) {
    const { email, password, nick } = userData;

	  const existingUser = await this.userRepository.findOne({where: {email}})
	  if (existingUser)
		  return { success: false, message: 'USER_ALREADY_EXISTS' };
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.userRepository.create({
      email: email,
      password: hashedPassword,
	    refresh_token: null,
    });
    const savedUser = await this.userRepository.save(newUser);
		console.log(`[signUp가입 성공: ID ${savedUser.id}`);

    try {
    await firstValueFrom(
      this.httpService.post('http://user-service:4001/init', {
        id: savedUser.id,
        email: email,
        nickname: nick,
      })
    );
  } catch (error) {
    // 3. 만약 호출 실패 시, Auth DB에 저장한 걸 롤백하거나 에러 처리 필요
    console.error('[signUp]User 서비스 초기화 실패:', error.response?.data || error.message);
  }
	  return { success: true, message: 'SIGNUP_SUCCESS' };
  }

  async login(loginData: any) {
    const { email, password } = loginData;
    const user = await this.userRepository.findOne({ where: { email } });
  
    if (!user)
    	return { success: false, message: 'USER_NOT_FOUND' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch)
	  {
		  const payload = { sub: user.id, email: user.email };
		  const token = this.jwtService.sign(payload);
		  console.log('[login]로그인 성공');
      	return {
        success: true,
        message: 'LOGIN_SUCCESS',
        accessToken: token,
      };
    }
    // 실패 시
  return { success: false, message: 'INVALID_PASSWORD' };
  }

  async logout() {
    // 나중에 여기에 '로그아웃 시 수행할 작업'을 추가할 수 있습니다.
    // 예: Redis에서 토큰 삭제, 접속 로그 업데이트 등
    
    console.log('[logout]로그아웃 성공');
    return {
      success: true,
      message: '성공적으로 로그아웃되었습니다.',
    };
  }
}
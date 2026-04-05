import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
	private readonly jwtService: JwtService,
  ) {}

  async signUp(userData: any) {
    const { email, password, nick } = userData;

	  const existingUser = await this.userRepository.findOne({where: {email}})
	  if (existingUser)
		  return { success: false, message: '이미 가입된 이메일입니다.' };
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
	  nickname: nick,
    });
    await this.userRepository.save(newUser);
		console.log('가입 성공');
	  return {success: true, message: '회원가입 성공' };
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
		  console.log('로그인 성공');
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
    
    console.log('로그아웃 성공');
    return {
      success: true,
      message: '성공적으로 로그아웃되었습니다.',
    };
  }

  async getMe(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ where: { id: decoded.id } });
      if (!user)
        throw new Error();
      console.log('get me 성공');
      return user;
    } catch (error) {
      // 토큰이 조작되었거나 만료된 경우
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

  }
}
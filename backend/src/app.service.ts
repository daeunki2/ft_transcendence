import { Injectable } from '@nestjs/common';
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
	return {success: true, message: '회원가입 성공' };
  }

  async login(loginData: any) {
    const { email, password } = loginData;

    const user = await this.userRepository.findOne({ where: { email } });

	if (!user) {
    	return { success: false, message: '존재하지 않는 계정입니다.' };
	}

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch)
	{
		const payload = { sub: user.id, email: user.email };
		const token = this.jwtService.sign(payload);
		console.log('성공');
      	return {
        success: true,
        message: 'DB 인증 성공!',
        accessToken: token,
      };
    }

    // 실패 시
    return { success: false, message: '이메일 또는 비밀번호가 틀립니다.' };
  }
}
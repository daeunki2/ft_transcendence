import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(userData: any) {
    const { email, password } = userData;

	const existingUser = await this.userRepository.findOne({where: {email}})
	if (existingUser)
			return { success: false, message: '이미 가입된 이메일입니다.' };
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    return await this.userRepository.save(newUser);
  }

  async validateUser(loginData: any) {
    const { email, password } = loginData;

    const user = await this.userRepository.findOne({ where: { email } });

    // 유저가 있고 비밀번호가 일치하는지 확인 (평문 비교)
    if (user && user.password === password) {
      return {
        success: true,
        message: 'DB 인증 성공!',
        accessToken: 'real-database-token-' + user.id, //테스트 용 나중에 jwt토큰으로 대체
      };
    }

    // 실패 시
    return { success: false, message: '이메일 또는 비밀번호가 틀립니다.' };
  }
}
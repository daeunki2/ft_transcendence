import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
	  private readonly jwtService: JwtService,

  ) {}

  async createUserProfile(id: string, email: string, nickname: string, ) {
    try {

    const newUser = this.userRepository.create({
      userId: id, // 전달받은 UUID
      email: email,
      nickname: nickname,
      userPhoto: 1, 
    });

    console.log('유저 db생성');
    return await this.userRepository.save(newUser);
  } catch (error) {
    console.error('프로필 생성 중 DB 에러:', error.message);
    throw new InternalServerErrorException('유저 프로필 생성 중 서버 에러가 발생했습니다.');
  }
  }

  async getMe(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      console.log('[getMe] Decoded JWT:', decoded);
      const user = await this.userRepository.findOne({ where: { userId: decoded.sub } });
      if (user)
        console.log('[getMe] DB에서 찾은 실제 userId:', user.userId);
      else
        console.log('[getMe] userId 못 찾음');
      return user;
    } catch (error) {
      // 토큰이 조작되었거나 만료된 경우
      throw new UnauthorizedException('[getMe] 유효하지 않은 토큰입니다.');
    }
  }
}
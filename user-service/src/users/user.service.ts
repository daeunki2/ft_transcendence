import { Injectable, InternalServerErrorException, UnauthorizedException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { isNicknameAllowed } from '../utils/nickname-filter';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}

  async createUserProfile(id: string, loginId: string, nickname: string, )
  {
    try
    {
      if ( typeof nickname !== 'string' || nickname.trim() === '' || !isNicknameAllowed(nickname) )
      { throw new BadRequestException('NICKNAME_NOT_ALLOWED'); }

      const normalizedNickname = nickname.trim();
      const existingNickname = await this.userRepository.findOne({
        where: { nickname: normalizedNickname },
      });
      if (existingNickname) {
        throw new BadRequestException('NICKNAME_ALREADY_EXISTS');
      }

      const newUser = this.userRepository.create({
      userId: id, // 전달받은 UUID
      loginId,
      nickname: normalizedNickname,
      userPhoto: "http://localhost:4001/uploads/default.jpg", 
      role: "normal",
      });

      console.log('유저 db생성');
      return await this.userRepository.save(newUser);
    }
    catch (error)
    {
      if (error instanceof BadRequestException)
        {throw error;}
      console.error('프로필 생성 중 DB 에러:', error.message);
      throw new InternalServerErrorException('유저 프로필 생성 중 서버 에러가 발생했습니다.');
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });
    
    if (!user) return null;

    // 🟢 [추가] 사진이 default가 아닌데, 실제 파일이 서버에 없는 경우 체크
    const DEFAULT_PHOTO_URL = "http://localhost:4001/uploads/default.jpg";
    
    if (user.userPhoto && user.userPhoto !== DEFAULT_PHOTO_URL) {
      // URL에서 파일명만 추출 (예: http://.../uploads/abc.jpg -> abc.jpg)
      const fileName = user.userPhoto.split('/').pop();
      if (fileName) {
      const filePath = join(process.cwd(), 'uploads', fileName);
      
      // 4. 파일이 실제로 없으면 DB 업데이트
      if (!fs.existsSync(filePath)) {
        console.log(`📂 파일 없음: ${fileName}. 기본값으로 복구.`);
        user.userPhoto = DEFAULT_PHOTO_URL;
        await this.userRepository.save(user);
      }
    }
    }

    return user;
  }

  async updateProfile(userId: string, data: { userPhoto?: string; nickname?: string }) {
    // 상태 기반 제한: 매칭/게임 중에는 프로필 수정(닉네임/아바타) 차단
    await this.assertProfileEditable(userId);

    const user = await this.getMe(userId); 
    
    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    // 닉네임 금칙어 확인 
    if (data.nickname !== undefined) {
    if (typeof data.nickname !== 'string' || data.nickname.trim() === '' || !isNicknameAllowed(data.nickname)) {
      throw new BadRequestException('NICKNAME_NOT_ALLOWED');
    }
    const normalizedNickname = data.nickname.trim();
    const existingNickname = await this.userRepository.findOne({
      where: { nickname: normalizedNickname },
    });
    if (existingNickname && existingNickname.userId !== user.userId) {
      throw new BadRequestException('NICKNAME_ALREADY_EXISTS');
    }
    data.nickname = normalizedNickname;
    }

    // 2. DB 업데이트 (TypeORM 문법에 맞게 수정)
    await this.userRepository.update(
      { userId: user.userId }, // 조건
      { 
        // 데이터가 있는 것만 업데이트
        ...(data.userPhoto !== undefined && { userPhoto: data.userPhoto }),
        ...(data.nickname !== undefined && { nickname: data.nickname }),
      }
    );

    // 3. 업데이트된 최신 유저 정보를 다시 가져와서 반환
    console.log('[updateProfile] update 성공', user.userPhoto);
    return await this.userRepository.findOne({ where: { userId: user.userId } });
  }

  async handleFileUpload(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('파일이 존재하지 않습니다.');
    }

    // 1. 파일 접근 URL 생성
    const fileUrl = `http://localhost:4001/uploads/${file.filename}`;

    // 2. DB 업데이트 (기존 updateProfile 로직 재활용 가능)
    const updatedUser = await this.updateProfile(userId, { userPhoto: fileUrl });

    return {
      success: true,
      url: fileUrl,
      user: updatedUser
    };
  }


  // 가드용 공통함수
  private async assertProfileEditable(userId: string): Promise<void> {
    const baseUrl =
      process.env.PRESENCE_INTERNAL_BASE_URL ?? 'http://api-gateway:8000/internal/presence';
    const timeoutMs = 700;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}/${userId}`, { signal: controller.signal });
      if (!response.ok) {
        throw new InternalServerErrorException('PRESENCE_CHECK_FAILED');
      }

      const presence = (await response.json()) as {
        internalStatus?: 'OFFLINE' | 'ONLINE' | 'MATCHING' | 'IN_GAME';
      };

      if (presence.internalStatus === 'MATCHING' || presence.internalStatus === 'IN_GAME') {
        throw new BadRequestException('PRESENCE_ACTION_BLOCKED');
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException('PRESENCE_CHECK_FAILED');
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

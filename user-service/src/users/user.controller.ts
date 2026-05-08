import { Controller, Post, Body, Res, Get, Req, Patch, Delete, Param, UnauthorizedException, BadRequestException, NotFoundException, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getCurrentUserId(req: Request): string {
    const raw = req.headers['x-user-id'];
    if (!raw || Array.isArray(raw) || raw.trim() === '') {
      throw new UnauthorizedException('x-user-id header required (temp)');
    }
    return raw;
  }

  @Post('uploadPhoto')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (Byte 단위)
  },

    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
        return callback(new BadRequestException('IMAGE_FORMAT_NOT_ALLOWED'), false);
      }
      callback(null, true);
    },
  }))
  async uploadPhoto(
    @Req() req: Request, 
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = this.getCurrentUserId(req);
    
    // 비즈니스 로직은 서비스로 위임
    return await this.userService.handleFileUpload(userId, file);
  }

  @Post('init') // auth-service가 호출하는 경로
  async initializeUser(
    @Body()
    data: { id: string; email: string | null; nickname: string; role?: string },
  ) {
    const user = await this.userService.createUserProfile(
      data.id,
      data.email,
      data.nickname,
      data.role ?? 'normal',
    );
    return {
      success: true,
      user: {
        userId: user.userId,
        loginId: user.loginId,
        nickname: user.nickname,
        userPhoto: user.userPhoto,
        role: user.role,
      },
    };
  }

  // 내부 호출 전용 — auth-service 의 게스트 cleanup cron 이 호출.
  // 외부 노출 차단은 향후 gateway 가 /internal/* 경로를 막거나 internal-secret 헤더 검사로 보강.
  @Delete('internal/users/:userId')
  async deleteGuestUser(
    @Param('userId') userId: string,
    @Headers('x-internal-secret') secret?: string,
  ) {
    const expected = process.env.INTERNAL_SECRET;
    if (expected && secret !== expected) {
      throw new UnauthorizedException('INTERNAL_SECRET_INVALID');
    }
    return this.userService.deleteGuestUser(userId);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    if (!currentUserId) {
      throw new UnauthorizedException('[getMe] 인증 정보가 없습니다.');
    }

    console.log('[getme] 입장');
    const user = await this.userService.getMe(currentUserId);

    if (!user) {
      throw new NotFoundException('[getMe] 유저를 찾을 수 없습니다.');
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        loginId: user.loginId,
        nickname: user.nickname,
        userPhoto: user.userPhoto,
        role: user.role,
      },
    };
  }


  @Patch('me')
  async updateProfile(
    @Req() req: Request,
    @Body() data: { userPhoto?: string; nickname?: string }
  ) {
    const currentUserId = this.getCurrentUserId(req);

    if (!currentUserId) {
      throw new UnauthorizedException('[updateProfile] 인증 정보가 없습니다.');
    }

    const updatedUser = await this.userService.updateProfile(currentUserId, data);

    if (!updatedUser) {
      throw new NotFoundException('[updateProfile] 유저를 찾을 수 없습니다.');
    }

    return {
      success: true,
      user: {
        userId: updatedUser.userId,
        loginId: updatedUser.loginId,
        nickname: updatedUser.nickname,
        userPhoto: updatedUser.userPhoto,
        role: updatedUser.role,
      },
    };
  }
}

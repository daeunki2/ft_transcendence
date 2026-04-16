import { Controller, Post, Body, Res, Get, Req, Patch, UnauthorizedException, NotFoundException, Headers } from '@nestjs/common';
import { UserService } from './user.service';

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

  @Post('init') // auth-service가 호출하는 경로

  async initializeUser(@Body() data: { id: string; email: string; nickname: string }) {
    return await this.userService.createUserProfile(data.id, data.email, data.nickname);
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const currentUserId = this.getCurrentUserId(req);

    if (!currentUserId) {
      throw new UnauthorizedException('[getMe] 인증 정보가 없습니다.');
    }

    const user = await this.userService.getMe(currentUserId);

    if (!user) {
      throw new NotFoundException('[getMe] 유저를 찾을 수 없습니다.');
    }

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        nickname: user.nickname,
        userPhoto: user.userPhoto,
      },
    };
  }


  @Patch('me')
  async updateProfile(
    @Req() req: Request,
    @Body() data: { userPhoto?: number; nickname?: string }
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
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        userPhoto: updatedUser.userPhoto,
      },
    };
  }
}

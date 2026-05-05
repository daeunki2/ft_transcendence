import { useCallback, useContext} from 'react';
import { AuthContext } from '../contexts/AuthContext.types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

export const useAuthInit = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthInit must be used within an AuthProvider');
  }

  const { setUser } = context;

  // 인증 검증과 프로필 조회를 분리한다.
  // - 인증 검증: auth-service 의 /me 한 번만. JWT 만 검증하므로 user-service 다운에 영향 없음.
  // - 프로필 조회: user-service 의 /me. 실패해도 인증 상태는 끊지 않고 최소 정보로 user 를 채운다.
  // → user-service 다운 시 /home 같은 라우트는 정상 진입, /myspace·/social 은 ServiceGuard 가 처리.
  const fetchMe = useCallback(async (): Promise<boolean> => {
    const authResult = await authService.me().catch(() => null);
    if (!authResult?.success) {
      // 진짜 미인증: 토큰 없음/무효 + apiClient 의 자동 refresh 도 실패한 상태.
      return false;
    }

    const profileResult = await userService.getMe().catch(() => null);
    if (profileResult?.success) {
      setUser(profileResult.user);
      return true;
    }

    // 프로필을 못 가져온 경우(주로 user-service 다운). 인증은 살아있으니
    // 최소 정보로 user 를 채워서 user-service 비의존 라우트는 사용 가능하게 한다.
    setUser((prev) => prev ?? {
      userId: authResult.user.userId,
      id: authResult.user.id,
      nickname: '',
      userPhoto: '',
    });
    return true;
  }, [setUser]);

  return { fetchMe };
}

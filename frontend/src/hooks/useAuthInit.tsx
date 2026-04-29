import { useCallback, useContext} from 'react';
import { AuthContext } from '../contexts/AuthContext.types';
import { userService } from '../services/userService';

export const useAuthInit = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthInit must be used within an AuthProvider');
  }

  const { setUser} = context;

  const fetchMe = useCallback(async (): Promise<boolean> => {
    const response = await userService.getMe().catch(() => null);
    // 프로필을 가져온 경우에만 user 채움. 실패해도 인증 상태는 건드리지 않는다.
    // 진짜 세션 만료는 apiClient의 AUTH_SESSION_EXPIRED_EVENT가 처리한다.
    if (response?.success) {
      setUser(response.user);
    }
    return true;
  }, [setUser]);

  return { fetchMe };
}

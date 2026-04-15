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
    // 현재 apiClient는 실패를 { success: false }로 반환하므로 실패 분기를 명시적으로 처리합니다.
    /*
    try {
      const response = await userService.getMe();
      if (response && response.success) {
        setUser(response.user);
      }
		  console.log('get user:', response.user);
    } catch (error) {
      // 401 에러 등은 무시 (로그인 안 된 상태)
      setUser(null);
  };
    */

    try {
      const response = await userService.getMe();

      if (response?.success) {
        setUser(response.user);
        console.log('get user:', response.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      // 네트워크 오류 등 예외 케이스도 비로그인 상태로 정리
      setUser(null);
      return false;
    }
  }, [setUser]);
		return { fetchMe };
}

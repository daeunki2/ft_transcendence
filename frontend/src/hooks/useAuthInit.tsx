import { useContext} from 'react';
import { AuthContext } from '../contexts/AuthContext.types';
import { authService } from '../services/authService';

export const useAuthInit = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthInit must be used within an AuthProvider');
  }

  const { user, setUser} = context;

  const fetchMe = async () => {

    try {
      const response = await authService.getMe();
      if (response && response.success) {
        setUser(response.user);
      }
	  console.log('get user:', response.user);
    } catch (error) {
      // 401 에러 등은 무시 (로그인 안 된 상태)
      setUser(null);
  };

};
	return { fetchMe };
}
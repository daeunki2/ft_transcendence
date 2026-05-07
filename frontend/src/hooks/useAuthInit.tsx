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
    if (response?.success) {
      setUser(response.user);
      return true;
    }
    setUser(null);
    return false;
  }, [setUser]);

  return { fetchMe };
}

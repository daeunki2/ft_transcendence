import { useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AuthContext, GUEST_STORAGE_KEY } from './AuthContext.types';
import type { UserType } from './AuthContext.types';


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
};

// 주머니를 제공하는 Provider 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(
    () => sessionStorage.getItem(GUEST_STORAGE_KEY) === '1',
  );

  const enterGuestMode = useCallback(() => {
    sessionStorage.setItem(GUEST_STORAGE_KEY, '1');
    setUser(null);
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoading, isGuest, enterGuestMode, exitGuestMode }}
    >
      {children}
    </AuthContext.Provider>
  );
};

import {useState, useContext} from 'react';
import type {ReactNode} from 'react';
import { AuthContext } from './AuthContext.types';
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
  const [user, setUser] = useState< UserType | null>(null);
  const [isLoading] = useState(true); // 👈 처음에 서버 확인 전까지 true

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {/* 로딩 중일 때는 하위 컴포넌트(children)를 렌더링하지 않거나 로딩바를 띄울 수 있음 */}
      {children}
    </AuthContext.Provider>
  );
};
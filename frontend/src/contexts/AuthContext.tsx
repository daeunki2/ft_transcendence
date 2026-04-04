import { createContext} from 'react';
import {useState} from 'react';
import type {ReactNode} from 'react';

// 1. 주머니의 모양(타입) 정의
interface AuthContextType {
  user: { nick: string } | null;
  setUser: (user: { nick: string } | null) => void;
  isLoading: boolean; // 👈 로딩 상태 추가 (초기 데이터 확인용)
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. 주머니를 제공하는 Provider 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ nick: string } | null>(null);
  const [isLoading] = useState(true); // 👈 처음에 서버 확인 전까지 true


  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {/* 로딩 중일 때는 하위 컴포넌트(children)를 렌더링하지 않거나 로딩바를 띄울 수 있음 */}
      {children}
    </AuthContext.Provider>
  );
};
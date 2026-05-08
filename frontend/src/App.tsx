/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   App.tsx                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:47:36 by daeunki2          #+#    #+#             */
/*   Updated: 2026/05/08 10:40:13 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import SocialPage from './pages/SocialPage';
import MySpacePage from './pages/MySpacePage';
import { useAuthInit } from './hooks/useAuthInit';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Alert from './components/ui/Alert';
import { useI18n } from './i18n/useI18n';
import { useAuth } from './contexts/AuthContext';
import { io, type Socket } from 'socket.io-client';

const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';
export const PRESENCE_UPDATED_EVENT = 'presence:updated';
const PRESENCE_SOCKET_URL = import.meta.env.VITE_PRESENCE_SOCKET_URL ?? 'http://localhost:8000/presence';

function App() {
  const { fetchMe } = useAuthInit();
  const { messages } = useI18n();
  const { user, setUser } = useAuth();
  const currentUserId = user?.userId ?? null;
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const presenceSocketRef = useRef<Socket | null>(null); // 소켓 객체
  
  useEffect(() => {
    // 앱 진입 시 쿠키가 있다면 유저 정보를 가져오고, 가드는 이 확인 완료 후 동작
    fetchMe().finally(() => setIsAuthReady(true));
  }, []); // 딱 한 번 실행

  useEffect(() => {
    const onSessionExpired = () => {
      setSessionExpiredOpen(true);
    };

    window.addEventListener(
      AUTH_SESSION_EXPIRED_EVENT,
      onSessionExpired as EventListener,
    );
    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        onSessionExpired as EventListener,
      );
    };
  }, []);


  // 상태표시 기능 
  useEffect(() => {
    // 로그인 안 된 상태면 기존 소켓 연결을 끊고 ref를 초기화
    if (!currentUserId) {
      presenceSocketRef.current?.disconnect();
      presenceSocketRef.current = null;
      return;
    }
    // 로그인 되어 있고 이미 소켓 있으면 넘어가기
    if (presenceSocketRef.current) {
      return;
    }
    // 최초 로그인이면 게이트웨이의 네임스페이스로 웹소켓 연결 만들기
    const socket = io(PRESENCE_SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket'], // 쿠키를 포함시킴
    });// 비정상을 감지할 타이머 설정.
    const heartbeatTimer = window.setInterval(() => {
      socket.emit('presence.heartbeat');
    }, 5000); 
    socket.emit('presence.heartbeat');  // 연결확인 보조용
    // 게이트웨이의 소켓을 받으면 프론트 내에 전역으로 뿌려서 소셜페이지가 받아보게 함
    socket.on('presence.updated', (event) => {
      window.dispatchEvent(
        new CustomEvent(PRESENCE_UPDATED_EVENT, {
          detail: event,
        }),
      );
    });
    // 세션만료, 로그아웃 등 이전 소켓/타이머가 남지 않게 치우는 코드
    presenceSocketRef.current = socket;
    return () => {
      window.clearInterval(heartbeatTimer);
      socket.disconnect();
      if (presenceSocketRef.current === socket) {
        presenceSocketRef.current = null;
      }
    };
  }, [currentUserId]);

  const handleUnauthenticated = useCallback(() => {
    const isIntentLogout = sessionStorage.getItem('intent_logout') === '1';
    if (isIntentLogout) {
      sessionStorage.removeItem('intent_logout');
      return;
    }
    setSessionExpiredOpen(true);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute
              isAuthReady={isAuthReady}
              isAuthenticated={Boolean(user)}
              onUnauthenticated={handleUnauthenticated}
              revalidateAuth={fetchMe}
            >
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route
          path="/social" // 가드 추가
          element={
            <ProtectedRoute
              isAuthReady={isAuthReady}
              isAuthenticated={Boolean(user)}
              onUnauthenticated={handleUnauthenticated}
              revalidateAuth={fetchMe}
            >
              <SocialPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/myspace" // 가드 추가
          element={
            <ProtectedRoute
              isAuthReady={isAuthReady}
              isAuthenticated={Boolean(user)}
              onUnauthenticated={handleUnauthenticated}
              revalidateAuth={fetchMe}
            >
              <MySpacePage />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Alert
       //세션 만료 시 경고창으로 재로그인 유도 
        open={sessionExpiredOpen}
        title={messages.social.alertTitle}
        message={messages.errors.SESSION_EXPIRED}
        confirmText={messages.result.goLogin}
        onClose={() => {
          setSessionExpiredOpen(false);
          setUser(null);
          window.location.href = '/login';
        }}
      />
    </BrowserRouter>
  );
}

function ProtectedRoute({
  isAuthReady,
  isAuthenticated,
  onUnauthenticated,
  revalidateAuth,
  children,
}: {
  isAuthReady: boolean;
  isAuthenticated: boolean;
  onUnauthenticated: () => void;
  revalidateAuth: () => Promise<boolean>;
  children: React.ReactElement;
}) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!isAuthReady) {
        return;
      }
      if (!isAuthenticated) {
        onUnauthenticated();
        return;
      }

      // 보호 라우트 진입 시 쿠키-메모리 불일치를 줄이기 위한 1회 재검증
      setIsChecking(true);
      const ok = await revalidateAuth();
      if (!cancelled && !ok) {
        onUnauthenticated();
      }
      if (!cancelled) {
        setIsChecking(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthReady,
    isAuthenticated,
    onUnauthenticated,
    revalidateAuth,
    location.pathname,
  ]);

  if (!isAuthReady || isChecking) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}

export default App;

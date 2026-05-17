/* ************************************************************************** */
/* */
/* :::      ::::::::   */
/* HomePage.tsx                                       :+:      :+:    :+:   */
/* +:+ +:+         +:+     */
/* By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/* +#+#+#+#+#+   +#+           */
/* Created: 2026/03/21 18:46:40 by daeunki2          #+#    #+#             */
/* Updated: 2026/05/15 19:24:31 by chanypar         ###   ########.fr       */
/* */
/* ************************************************************************** */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { useAuth } from '../contexts/AuthContext';
import { useGameContext } from '../contexts/GameContext';
import GameMatchModal from '../components/ui/GameModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [gameType, setGameType] = useState<'match' | 'ai' | null>(null);

  const { 
    isConnected, 
    joinQueue,
    aiGame, 
    queueError, 
    matchInfo, 
    activateGameSocket,
    deactivateGameSocket,
    resetGameState 
  } = useGameContext();

  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  const handleStartMatch = (type: 'match' | 'ai') => {
    if (!user?.userId) {
      console.error('[Game] 유저 정보가 없어 매칭을 시작할 수 없습니다.');
      return;
    }
    
    // 버튼 클릭 시 소켓 활성화
    activateGameSocket();
    
    setGameType(type);
    setIsMatchStarted(true);
    setMatchModalOpen(true);
  };

  const handleCloseMatchModal = () => {
    setMatchModalOpen(false);
    setIsMatchStarted(false);
    setGameType(null);
    deactivateGameSocket();
    resetGameState(); // 상태 초기화
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!matchModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseMatchModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [matchModalOpen]);

  // 매칭 성공 시 페이지 이동 (matchInfo -> matchInfo로 수정)
  useEffect(() => {
    if (matchInfo) {
      console.log('[Game] 매칭 성공, 게임 시작:', matchInfo.opponent);
      navigate('/game');
    }
  }, [matchInfo, navigate]);

  // 에러 처리 로직 정리
  useEffect(() => {
    if (!queueError) return;
    
    // i18n 메시지 룩업
    const translated =
      (messages.errors as Record<string, string | undefined>)[queueError] // queueError가 문자열인 경우
      ?? messages.errors.SERVER_ERROR;

    setErrorAlert(translated);
    handleCloseMatchModal();
  }, [queueError, messages.errors]);

  // 연결 완료 후 큐 진입
  useEffect(() => {
    if (!matchModalOpen || !isMatchStarted || !isConnected) return;

    if (gameType === 'match') {
      joinQueue();
    }
    else if (gameType === 'ai') {
      aiGame();
    }

  }, [matchModalOpen, isMatchStarted, isConnected, gameType, joinQueue, aiGame]);

  return (
    <PageContainer header={<Navbar />} footer={<FooterLinks />}>
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '32px', color: theme.colors.text }}>
            {messages.HomePage.pong}
          </h1>
          <p style={{ marginTop: '8px', color: theme.colors.textMuted, fontSize: '14px' }}>
            {messages.HomePage.summary}
          </p>
        </div>

        <Card style={{ minHeight: '200px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: theme.colors.text }}>
              {messages.HomePage.gameRule}
            </h2>
            <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '14px' }}>
              {messages.HomePage.rule}
            </p>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <Button onClick={() => handleStartMatch('match')} style={{ width: '100%', maxWidth: '320px' }}>
              {messages.HomePage.match}
            </Button>
            <Button onClick={() => handleStartMatch('ai')} style={{ width: '100%', maxWidth: '320px' }}>
              {messages.HomePage.aiGame}
            </Button>
          </div>
        </Card>
      </div>
      <GameMatchModal 
        open={matchModalOpen}
        isConnected={isConnected}
        onClose={handleCloseMatchModal}
        // 만약 모달 내부에서 "매칭 완료!" 문구를 띄우고 싶다면 아래 props도 추가하세요
        // matchInfo={matchInfo} 
      />

      <Alert
        open={errorAlert !== null}
        title={messages.social.alertTitle}
        message={errorAlert ?? ''}
        confirmText={messages.result.false}
        onClose={() => setErrorAlert(null)}
      />
    </PageContainer>
  );
}
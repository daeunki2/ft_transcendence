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
    joinAiQueue,
    queueError,
    matchInfo,
    gameState,
    sendReady,
    activateGameSocket,
    deactivateGameSocket,
    resetGameState
  } = useGameContext();

  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  // suna : 내가 "게임 시작" 버튼을 눌러 ready 를 보냈는지. 매치가 새로 바뀌면 (gameId 변경) 자동으로 리셋.
  const [readySent, setReadySent] = useState(false);

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
    setReadySent(false);
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

  // suna : 새 매치(상대 ESC 후 재매칭 포함)가 잡히면 readySent 를 리셋해 다시 버튼이 보이게 한다.
  useEffect(() => {
    setReadySent(false);
  }, [matchInfo?.gameId]);

  // suna : 양쪽 ready 가 모이면 서버가 game loop 를 돌리고 첫 gameState 가 도착.
  // 그 시점에 비로소 /game 으로 이동한다(이전엔 matchInfo 만으로 이동했지만 그 사이에 ready 핸드셰이크가 끼임).
  useEffect(() => {
    if (gameState) {
      navigate('/game');
    }
  }, [gameState, navigate]);

  // suna : "게임 시작" 버튼 클릭 -> 서버에 ready 신호 송신.
  const handleReady = () => {
    sendReady();
    setReadySent(true);
  };

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

    if (gameType === 'ai') {
      joinAiQueue();
    } else {
      joinQueue();
    }
  }, [matchModalOpen, isMatchStarted, isConnected, gameType, joinQueue, joinAiQueue]);

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
        gameType={gameType}
        // suna : matchInfo 가 채워지면 모달이 "게임 시작" 단계로 전환.
        matched={Boolean(matchInfo)}
        readySent={readySent}
        onReady={handleReady}
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
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HomePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:40 by daeunki2          #+#    #+#             */
/*   Updated: 2026/05/11 21:17:14 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../hooks/useGame';
import GameMatchModal from '../components/ui/GameModal';

export default function HomePage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);

  const { isConnected, joinQueue, gameState } = useGame(
    isMatchStarted ? user?.userId ?? null : null,
    user?.nickname ?? null,
  );

  const handleStartMatch = () => {
    if (!user?.userId) {
      console.error('[Game] 유저 정보가 없어 매칭을 시작할 수 없습니다.');
      return;
    }

    setIsMatchStarted(true);
    setMatchModalOpen(true);
  };

  const handleCloseMatchModal = () => {
    setMatchModalOpen(false);
    setIsMatchStarted(false);
  };

  // useEffect(() => {
  //   if (!matchModalOpen) return;

  //   const onKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === 'Escape') {
  //       handleCloseMatchModal();
  //     }
  //   };

  //   window.addEventListener('keydown', onKeyDown);

  //   return () => {
  //     window.removeEventListener('keydown', onKeyDown);
  //   };
  // }, [matchModalOpen]);

  useEffect(() => {
    if (!matchModalOpen) return;
    if (!isMatchStarted) return;
    if (!isConnected) return;

    joinQueue();
  }, [matchModalOpen, isMatchStarted, isConnected, joinQueue]);

  useEffect(() => {
    // daeunki2수정 : 수정이유
    // 백엔드 매칭 성립 후 game_state를 받으면 실제 게임이 시작된 상태다.
    // 기존엔 이 시점에 /game 이동 로직이 없어 모달에서 무한 대기처럼 보였다.
    if (!matchModalOpen) return;
    if (!isMatchStarted) return;
    if (!gameState) return;
    navigate('/game');
  }, [matchModalOpen, isMatchStarted, gameState, navigate]);

  return (
    <PageContainer
      header={<Navbar />}
      footer={<FooterLinks />}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              color: theme.colors.text,
            }}
          >
            {messages.HomePage.pong}
          </h1>

          <p
            style={{
              marginTop: '8px',
              color: theme.colors.textMuted,
              fontSize: '14px',
            }}
          >
            {messages.HomePage.summary}
          </p>
        </div>

        <Card style={{ minHeight: '200px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '20px',
                color: theme.colors.text,
              }}
            >
              {messages.HomePage.gameRule}
            </h2>

            <p
              style={{
                margin: 0,
                color: theme.colors.textMuted,
                fontSize: '14px',
              }}
            >
              {messages.HomePage.rule}
            </p>
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            <Button
              onClick={handleStartMatch}
              style={{ width: '100%', maxWidth: '320px' }}
            >
              {messages.HomePage.match}
            </Button>

            <Button
              onClick={() => navigate('/ai-game')}
              style={{ width: '100%', maxWidth: '320px' }}
            >
              {messages.HomePage.aiGame}
            </Button>
          </div>
        </Card>
      </div>

      <GameMatchModal 
        open={matchModalOpen}
        isConnected={isConnected}
        onClose={handleCloseMatchModal}
      />
    </PageContainer>
  );
}

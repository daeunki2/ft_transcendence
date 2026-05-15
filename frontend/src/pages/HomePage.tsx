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
import Alert from '../components/ui/Alert';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../hooks/useGame';

export default function HomePage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  // 이유: queue_error 거절 사유를 i18n 룩업한 문구로 띄우기 위해 별도 상태로 보관.
  // useGame 훅이 state 를 초기화하기 전에 한 번 받아서 보여줘야 하므로 페이지 레벨로 끌어올림.
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // merge수정 : main의 matchInfo/queueError 흐름을 유지하고 daeunki2의 기록 저장용 nickname 전달만 추가함.
  const { isConnected, joinQueue, matchInfo, queueError, clearQueueError } = useGame(
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

  // merge수정 : daeunki2의 /game 이동은 gameState가 아니라 main 매칭 로직의 match_found 결과(matchInfo)를 기준으로 처리함.
  useEffect(() => {
    if (!matchModalOpen) return;
    if (!isMatchStarted) return;
    if (!matchInfo) return;
    navigate('/game');
  }, [matchModalOpen, isMatchStarted, matchInfo, navigate]);

  // 이유: 서버에서 queue_error 가 도착하면 매칭 모달을 닫고 i18n 룩업한 문구로 알림을 띄운다.
  // code 기준 룩업 → 미정의 시 서버 fallback message → 그것도 없으면 SERVER_ERROR.
  // 알림을 띄운 직후 훅 상태는 비워 다음 요청에 영향이 없게 한다.
  useEffect(() => {
    if (!queueError) return;
    const translated =
      (messages.errors as Record<string, string | undefined>)[queueError.code]
      ?? queueError.message
      ?? messages.errors.SERVER_ERROR;
    setErrorAlert(translated);
    setMatchModalOpen(false);
    setIsMatchStarted(false);
    clearQueueError();
  }, [queueError, messages.errors, clearQueueError]);

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

      {/* merge수정 : daeunki2의 GameMatchModal 대신 main의 Modal을 유지해 matchFound/ESC 안내와 queue_error Alert 흐름을 보존함. */}
      <Modal
        open={matchModalOpen}
        onClose={handleCloseMatchModal}
        closeOnOverlayClick={false}
      >
        <div
          style={{
            padding: '32px',
            color: theme.colors.text,
            textAlign: 'center',
          }}
        >
          {matchInfo
            ? messages.HomePage.matchFound
            : isConnected
              // daeunki2 수정 : connectGameJoin/connectGameServer는 i18n 타입에서 game 섹션으로 분리되어 있어 경로를 맞춤.
              ? messages.game.connectGameJoin
              : messages.game.connectGameServer}
          <br />
          {messages.HomePage.escCancel}
        </div>
      </Modal>

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

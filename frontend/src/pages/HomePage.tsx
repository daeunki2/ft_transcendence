/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HomePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:40 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/09 22:39:54 by chanypar         ###   ########.fr       */
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

export default function HomePage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const { theme } = useTheme();
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  useEffect(() => {
    if (!matchModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMatchModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [matchModalOpen]);

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
              onClick={() => setMatchModalOpen(true)}
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

      <Modal
        open={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        closeOnOverlayClick={false}
      >
        <div
          style={{
            padding: '32px',
            color: theme.colors.text,
            textAlign: 'center',
          }}
        >
          테스트, 클릭 제한, esc누르면 모달창에서 나옴
        </div>
      </Modal>
    </PageContainer>
  );
}
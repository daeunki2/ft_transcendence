/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HomePage.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:40 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/04 12:57:36 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FooterLinks from '../components/common/FooterLinks';
import Navbar from '../components/common/Navbar';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';
import { useAuthInit } from '../hooks/useAuthInit';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const { theme } = useTheme();
  const { fetchMe } = useAuthInit();

  useEffect(() => {
    fetchMe(); // 홈에 진입했을 때 서버에 내 정보 물어보기
  }, []); // 의존성 배열을 비워서 진입 시 딱 한 번 실행

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
              onClick={() => navigate('/match')}
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
    </PageContainer>
  );
}
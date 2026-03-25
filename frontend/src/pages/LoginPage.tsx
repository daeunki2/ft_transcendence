/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LoginPage.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:49 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/23 18:10:21 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/ui/PageContainer';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import TopControls from '../components/ui/TopControls';
import FooterLinks from '../components/common/FooterLinks';
import { useTheme } from '../theme/useTheme';
import { useI18n } from '../i18n/useI18n';

function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { messages } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log({
      email,
      password,
    });

    navigate('/home');
  };

  return (
    <PageContainer
      header={<TopControls />}
      footer={<FooterLinks />}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 auto',
        }}
      >
        <Card>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '28px',
                }}
              >
                {messages.login.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  color: theme.colors.textMuted,
                  fontSize: '14px',
                }}
              >
                {messages.login.subtitle}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
              }}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={messages.login.email}
              />

              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={messages.login.password}
              />
            </div>

            <Button onClick={handleLogin}>
              {messages.login.submit}
            </Button>

            <div
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: theme.colors.textMuted,
              }}
            >
              {messages.login.footerText}{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  color: theme.colors.primary,
                  fontSize: '14px',
                }}
              >
                {messages.login.footerLink}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export default LoginPage;
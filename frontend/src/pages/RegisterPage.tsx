/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RegisterPage.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:56 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/23 18:23:52 by daeunki2         ###   ########.fr       */
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

function RegisterPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { messages } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    console.log({
      email,
      password,
      confirmPassword,
    });

    navigate('/login');
  };

  return (
    <PageContainer
      header={<TopControls />}
      footer={<FooterLinks />}
    >
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
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
              {messages.register.title}
            </h1>

            <p
              style={{
                margin: 0,
                color: theme.colors.textMuted,
                fontSize: '14px',
              }}
            >
              {messages.register.subtitle}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={messages.register.email}
            />

            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={messages.register.password}
            />

            <Input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder={messages.register.confirmPassword}
            />
          </div>

          <Button onClick={handleRegister}>
            {messages.register.submit}
          </Button>

          <div
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: theme.colors.textMuted,
            }}
          >
            {messages.register.footerText}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
                color: theme.colors.primary,
                fontFamily: theme.font.family,
                fontSize: '14px',
              }}
            >
              {messages.register.footerLink}
            </button>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

export default RegisterPage;
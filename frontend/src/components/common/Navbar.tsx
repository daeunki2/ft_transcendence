/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Navbar.tsx                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 20:13:57 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 20:21:56 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../theme/useTheme';
import { useI18n } from '../../i18n/useI18n';
import Logo from './Logo';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, themeName } = useTheme();
  const { messages } = useI18n();

  const isRetro = themeName === 'retro';

  const menus = [
    { label: messages.navbar.pong, path: '/home' },
    { label: messages.navbar.social, path: '/social' },
    { label: messages.navbar.mySpace, path: '/myspace' },
  ];

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={() => navigate('/home')}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Logo width="180px" />
      </button>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;

          return (
            <button
              key={menu.path}
              type="button"
              onClick={() => navigate(menu.path)}
              style={{
                border: isRetro
                  ? 'none'
                  : `${theme.borderWidth.thin} solid ${theme.colors.border}`,
                background: isActive ? theme.colors.primary : theme.colors.surface,
                color: isActive ? theme.colors.primaryText : theme.colors.text,
                borderRadius: theme.radius.md,
                padding: '10px 14px',
                minHeight: '40px',
                cursor: 'pointer',
                fontFamily: theme.font.family,
                fontSize: '14px',
              }}
            >
              {menu.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            border: isRetro
              ? 'none'
              : `${theme.borderWidth.thin} solid ${theme.colors.border}`,
            background: theme.colors.surface,
            color: theme.colors.text,
            borderRadius: theme.radius.md,
            padding: '10px 14px',
            minHeight: '40px',
            cursor: 'pointer',
            fontFamily: theme.font.family,
            fontSize: '14px',
          }}
        >
          {messages.navbar.logout}
        </button>
      </div>
    </div>
  );
}
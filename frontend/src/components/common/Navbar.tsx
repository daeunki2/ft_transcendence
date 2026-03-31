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

import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/useI18n';
import Logo from './Logo';
import ToggleSwitch from '../ui/ToggleSwitch';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { useTheme } from '../../theme/useTheme';
import Button from '../ui/Button';

const styles = {
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  logoButton: {
    border: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
  },
} as const;

export default function Navbar() {
const { themeName, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { messages } = useI18n();

  const menus = [
    { label: messages.navbar.pong, path: '/home' },
    { label: messages.navbar.social, path: '/social' },
    { label: messages.navbar.mySpace, path: '/myspace' },
  ];

  return (
    <div style={styles.root}>
      <div style={styles.left}>
        <button
          type="button"
          onClick={() => navigate('/home')}
          style={styles.logoButton}
        >
          <Logo width="180px" />
        </button>

        {menus.map((menu) => (
          <Button
            key={menu.path}
            onClick={() => navigate(menu.path)}
          >
            {menu.label}
          </Button>
        ))}
      </div>

      <div style={styles.right}>
        <LanguageSwitcher />
        <ToggleSwitch
			isOn={themeName === 'future'}
			onToggle={toggleTheme}
		/>
        <Button onClick={() => navigate('/')}>
          {messages.navbar.logout}
        </Button>
      </div>
    </div>
  );
}
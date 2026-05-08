/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   providers.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: chanypar <chanypar@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:12 by daeunki2          #+#    #+#             */
/*   Updated: 2026/04/04 10:57:26 by chanypar         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { ReactNode } from 'react';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ServiceHealthProvider } from '../contexts/ServiceHealthContext';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ServiceHealthProvider>
          <I18nProvider>{children}</I18nProvider>
        </ServiceHealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
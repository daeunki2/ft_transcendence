/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   providers.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:12 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 18:46:13 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { ReactNode } from 'react';
import { ThemeProvider } from '../theme/ThemeContext';
import { I18nProvider } from '../i18n/I18nContext';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
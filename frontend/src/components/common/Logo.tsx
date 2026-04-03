/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Logo.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: daeunki2 <daeunki2@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/03/21 18:46:30 by daeunki2          #+#    #+#             */
/*   Updated: 2026/03/21 18:46:31 by daeunki2         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useTheme } from '../../theme/useTheme';
import logoRetro from '../../assets/logo_retro.png';
import logoFuture from '../../assets/logo_future.png';

type LogoProps = {
  width?: string;
};

function Logo({ width = '360px' }: LogoProps) {
  const { themeName } = useTheme();

  const logo = themeName === 'retro' ? logoRetro : logoFuture;

  return (
    <img
      src={logo}
      alt="logo"
      style={{
        width,
        maxWidth: '100%',
        height: 'auto',
      }}
    />
  );
}

export default Logo;
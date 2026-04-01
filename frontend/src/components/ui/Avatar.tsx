import type { HTMLAttributes, CSSProperties } from 'react';
import { useTheme } from '../../theme/useTheme';

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export default function Avatar({
  size = 40,
  style,
  ...props
}: AvatarProps) {
  const { theme, themeName } = useTheme();

  const isRetro = themeName === 'retro';

  const avatarStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: isRetro ? '0px' : '50%',
    background: theme.colors.primary,
    flexShrink: 0,

    border: isRetro
      ? 'none'
      : `${theme.borderWidth.thin} solid ${theme.colors.border}`,

    boxShadow: 'none',
  };

  return (
    <div
      {...props}
      style={{
        ...avatarStyle,
        ...style,
      }}
    />
  );
}

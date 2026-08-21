import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';

import { useTheme } from '../theme';

export type IconName = ComponentProps<typeof Feather>['name'];

/** Icon sizes are tokenized so icons stay optically consistent with text. */
const sizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, '2xl': 32 } as const;

export type IconSize = keyof typeof sizes;

export type IconProps = {
  name: IconName;
  size?: IconSize;
  color?: string;
};

export function Icon({ name, size = 'md', color }: IconProps) {
  const t = useTheme();
  return <Feather name={name} size={sizes[size]} color={color ?? t.color.textSecondary} />;
}

export const iconSizes = sizes;

import {
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '../theme';
import type { TextVariant } from '../theme/tokens';

export type TextTone =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'placeholder'
  | 'inverse'
  | 'onChrome'
  | 'onChromeMuted'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: TextStyle['textAlign'];
  /** Renders digits with tabular figures so numeric columns line up. */
  tabular?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Text({
  variant = 'body',
  tone = 'default',
  weight,
  align,
  tabular = false,
  style,
  ...rest
}: TextProps) {
  const t = useTheme();

  const toneColor: Record<TextTone, string> = {
    default: t.color.text,
    secondary: t.color.textSecondary,
    muted: t.color.textMuted,
    placeholder: t.color.textPlaceholder,
    inverse: t.color.textInverse,
    onChrome: t.color.textOnChrome,
    onChromeMuted: t.color.textOnChromeMuted,
    brand: t.tone.brand.onSurface,
    success: t.tone.success.onSurface,
    warning: t.tone.warning.onSurface,
    danger: t.tone.danger.onSurface,
  };

  const recipe = t.typography.variants[variant];

  return (
    <RNText
      {...rest}
      style={[
        { fontFamily: t.typography.fontFamily },
        recipe as TextStyle,
        { color: toneColor[tone] },
        weight ? { fontWeight: t.typography.fontWeight[weight] } : null,
        align ? { textAlign: align } : null,
        tabular ? ({ fontVariant: ['tabular-nums'] } as TextStyle) : null,
        style,
      ]}
    />
  );
}

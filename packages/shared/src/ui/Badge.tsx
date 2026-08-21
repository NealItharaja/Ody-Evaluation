import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { SemanticTone } from '../theme/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type BadgeProps = {
  label: string;
  tone?: SemanticTone;
  variant?: 'soft' | 'solid' | 'outline';
  size?: 'sm' | 'md';
  /** Leading status dot — the default read for order/entity status. */
  dot?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function Badge({
  label,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  dot = false,
  icon,
  style,
}: BadgeProps) {
  const t = useTheme();
  const ramp = t.tone[tone];

  const background =
    variant === 'solid' ? ramp.solid : variant === 'outline' ? 'transparent' : ramp.surface;
  const foreground = variant === 'solid' ? ramp.onSolid : ramp.onSurface;
  const border = variant === 'outline' ? ramp.border : 'transparent';

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: t.space[1.5],
          backgroundColor: background,
          borderColor: border,
          borderWidth: t.borderWidth.thin,
          borderRadius: t.radius.full,
          paddingHorizontal: size === 'sm' ? t.space[2] : t.space[3],
          paddingVertical: size === 'sm' ? t.space[0.5] : t.space[1],
        },
        style,
      ]}
    >
      {dot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: t.radius.full,
            backgroundColor: variant === 'solid' ? ramp.onSolid : ramp.solid,
          }}
        />
      ) : null}
      {icon ? <Icon name={icon} size="xs" color={foreground} /> : null}
      <Text
        variant={size === 'sm' ? 'overline' : 'caption'}
        weight="semibold"
        style={{ color: foreground }}
      >
        {label}
      </Text>
    </View>
  );
}

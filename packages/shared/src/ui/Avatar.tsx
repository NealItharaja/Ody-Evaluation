import { View } from 'react-native';

import { useTheme } from '../theme';
import { Text } from './Text';

const sizes = { sm: 28, md: 34, lg: 44 } as const;

export type AvatarProps = {
  name: string;
  size?: keyof typeof sizes;
};

/** Deterministic initial avatar — same person always gets the same color. */
export function Avatar({ name, size = 'md' }: AvatarProps) {
  const t = useTheme();
  const dimension = sizes[size];

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const ramps = [
    t.palette.brand,
    t.palette.blue,
    t.palette.purple,
    t.palette.amber,
    t.palette.green,
  ];
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ramp = ramps[hash % ramps.length]!;

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: t.radius.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ramp[100],
        borderWidth: t.borderWidth.thin,
        borderColor: ramp[200],
      }}
    >
      <Text
        variant={size === 'sm' ? 'overline' : 'label'}
        weight="semibold"
        style={{ color: ramp[700] }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
}

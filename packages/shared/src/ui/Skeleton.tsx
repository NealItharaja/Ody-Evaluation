import { useEffect, useRef } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { RadiusToken } from '../theme/tokens';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  radius?: RadiusToken;
  style?: StyleProp<ViewStyle>;
};

/** Pulsing placeholder block. Composed into higher-level loading patterns. */
export function Skeleton({ width = '100%', height = 14, radius = 'sm', style }: SkeletonProps) {
  const t = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        {
          width,
          height,
          borderRadius: t.radius[radius],
          backgroundColor: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [t.color.skeleton, t.color.skeletonHighlight],
          }) as unknown as string,
        },
        style,
      ]}
    />
  );
}

/** Loading placeholder shaped like a metric tile. */
export function SkeletonMetric() {
  const t = useTheme();
  return (
    <View style={{ gap: t.space[3] }}>
      <Skeleton width={96} height={12} />
      <Skeleton width={132} height={28} radius="md" />
      <Skeleton width={72} height={12} />
    </View>
  );
}

/** Loading placeholder shaped like a table body. */
export function SkeletonRows({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  const t = useTheme();
  return (
    <View>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            gap: t.space[6],
            alignItems: 'center',
            paddingHorizontal: t.space[5],
            paddingVertical: t.space[4],
            borderBottomWidth: rowIndex === rows - 1 ? 0 : t.borderWidth.thin,
            borderBottomColor: t.color.border,
          }}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton key={columnIndex} width={columnIndex === 0 ? 160 : 88} height={12} />
          ))}
        </View>
      ))}
    </View>
  );
}

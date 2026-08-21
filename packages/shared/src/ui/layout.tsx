import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { SpaceToken } from '../theme/tokens';

type FlexAlign = ViewStyle['alignItems'];
type FlexJustify = ViewStyle['justifyContent'];

type StackProps = ViewProps & {
  gap?: SpaceToken;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  flex?: number;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal flex container with token-based gap. */
export function Row({
  gap = 0,
  align = 'center',
  justify,
  wrap,
  flex,
  style,
  ...rest
}: StackProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'row',
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? 'wrap' : 'nowrap',
          gap: t.space[gap],
        },
        flex !== undefined ? { flex } : null,
        style,
      ]}
    />
  );
}

/** Vertical flex container with token-based gap. */
export function Column({ gap = 0, align, justify, flex, style, ...rest }: StackProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'column',
          alignItems: align,
          justifyContent: justify,
          gap: t.space[gap],
        },
        flex !== undefined ? { flex } : null,
        style,
      ]}
    />
  );
}

/** Pushes siblings apart inside a Row/Column. */
export function Spacer({ size }: { size?: SpaceToken }) {
  const t = useTheme();
  if (size === undefined) return <View style={{ flex: 1 }} />;
  return <View style={{ width: t.space[size], height: t.space[size] }} />;
}

export type GridProps = ViewProps & {
  /** Minimum width a child needs before the grid wraps it to the next line. */
  minChildWidth?: number;
  gap?: SpaceToken;
  style?: StyleProp<ViewStyle>;
};

/**
 * Simple responsive grid. Children are laid out in a wrapping row and each is
 * expected to declare `flexGrow`/`minWidth` via `GridItem`.
 */
export function Grid({ gap = 6, style, ...rest }: GridProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[gap] }, style]}
    />
  );
}

export function GridItem({
  minWidth = 240,
  grow = 1,
  basis,
  style,
  ...rest
}: ViewProps & {
  minWidth?: number;
  grow?: number;
  basis?: number | string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      {...rest}
      style={[
        { flexGrow: grow, flexShrink: 1, minWidth, flexBasis: (basis ?? minWidth) as number },
        style,
      ]}
    />
  );
}

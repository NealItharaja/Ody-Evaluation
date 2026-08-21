import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import type { ElevationToken, RadiusToken, SpaceToken } from '../theme/tokens';
import { Row } from './layout';
import { Text } from './Text';

export type SurfaceProps = ViewProps & {
  padding?: SpaceToken;
  radius?: RadiusToken;
  elevation?: ElevationToken;
  /** `sunken` for inset panels, `plain` for no background. */
  variant?: 'raised' | 'sunken' | 'plain';
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Surface({
  padding = 0,
  radius = 'lg',
  elevation = 1,
  variant = 'raised',
  bordered = true,
  style,
  ...rest
}: SurfaceProps) {
  const t = useTheme();

  const background =
    variant === 'sunken'
      ? t.color.surfaceSunken
      : variant === 'plain'
        ? 'transparent'
        : t.color.surface;

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: background,
          borderRadius: t.radius[radius],
          padding: t.space[padding],
          borderWidth: bordered ? t.borderWidth.thin : 0,
          borderColor: t.color.border,
        },
        variant === 'raised' ? (t.elevation[elevation] as ViewStyle) : null,
        style,
      ]}
    />
  );
}

export type CardProps = Omit<SurfaceProps, 'padding'> & {
  title?: string;
  description?: string;
  /** Rendered on the right of the header — usually an action button or filter. */
  action?: ReactNode;
  /** Removes body padding for cards that host a full-bleed table. */
  flush?: boolean;
  children?: ReactNode;
};

/**
 * The workhorse container for dashboard panels: optional header with title,
 * description and an action slot, plus a body that can be flush for tables.
 */
export function Card({ title, description, action, flush = false, children, ...rest }: CardProps) {
  const t = useTheme();
  const hasHeader = Boolean(title || description || action);

  return (
    <Surface {...rest} padding={0}>
      {hasHeader ? (
        <Row
          align="flex-start"
          justify="space-between"
          gap={4}
          style={{
            paddingHorizontal: t.space[5],
            paddingTop: t.space[5],
            paddingBottom: flush ? t.space[4] : t.space[3],
            borderBottomWidth: flush ? t.borderWidth.thin : 0,
            borderBottomColor: t.color.border,
          }}
        >
          <View style={{ flexShrink: 1, gap: t.space[1] }}>
            {title ? <Text variant="h3">{title}</Text> : null}
            {description ? (
              <Text variant="bodySm" tone="muted">
                {description}
              </Text>
            ) : null}
          </View>
          {action}
        </Row>
      ) : null}
      <View
        style={
          flush
            ? undefined
            : {
                paddingHorizontal: t.space[5],
                paddingTop: hasHeader ? 0 : t.space[5],
                paddingBottom: t.space[5],
              }
        }
      >
        {children}
      </View>
    </Surface>
  );
}

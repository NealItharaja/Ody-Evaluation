import { useState, type ReactNode } from 'react';
import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Icon, type IconName } from './Icon';
import { Row } from './layout';
import { Text } from './Text';

/* ---------------------------------------------------------------- nav item */

export type NavItemProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  icon: IconName;
  active?: boolean;
  /** Small count pill, e.g. pending orders. */
  badge?: number | string;
  collapsed?: boolean;
  /** `chrome` for the dark sidebar, `surface` for light contexts. */
  surface?: 'chrome' | 'surface';
};

export function NavItem({
  label,
  icon,
  active = false,
  badge,
  collapsed = false,
  surface = 'chrome',
  ...rest
}: NavItemProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  const onChrome = surface === 'chrome';

  const background = active
    ? onChrome
      ? 'rgba(255, 255, 255, 0.10)'
      : t.tone.brand.surface
    : hovered
      ? onChrome
        ? 'rgba(255, 255, 255, 0.06)'
        : t.color.surfaceHover
      : 'transparent';

  const foreground = active
    ? onChrome
      ? t.color.textInverse
      : t.tone.brand.onSurface
    : onChrome
      ? t.color.textOnChromeMuted
      : t.color.textSecondary;

  return (
    <Pressable
      {...rest}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[3],
        height: 38,
        paddingHorizontal: t.space[3],
        borderRadius: t.radius.md,
        backgroundColor: background,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}
    >
      <Icon name={icon} size="md" color={foreground} />
      {collapsed ? null : (
        <>
          <Text
            variant="label"
            weight={active ? 'semibold' : 'medium'}
            style={{ color: foreground, flex: 1 }}
          >
            {label}
          </Text>
          {badge !== undefined ? (
            <View
              style={{
                minWidth: 20,
                paddingHorizontal: t.space[1.5],
                paddingVertical: 1,
                borderRadius: t.radius.full,
                alignItems: 'center',
                backgroundColor: onChrome ? t.color.accent : t.tone.brand.solid,
              }}
            >
              <Text
                variant="overline"
                style={{ color: onChrome ? t.palette.neutral[900] : t.color.textInverse }}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------------------- tabs */

export type TabItem<T extends string = string> = {
  value: T;
  label: string;
  count?: number;
  icon?: IconName;
};

export type TabsProps<T extends string = string> = {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/** Underlined tab bar used for in-page section switching and list filters. */
export function Tabs<T extends string = string>({ items, value, onChange, style }: TabsProps<T>) {
  const t = useTheme();

  return (
    <Row
      gap={1}
      style={[{ borderBottomWidth: t.borderWidth.thin, borderBottomColor: t.color.border }, style]}
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          item={item}
          active={item.value === value}
          onPress={() => onChange(item.value)}
        />
      ))}
    </Row>
  );
}

function Tab<T extends string>({
  item,
  active,
  onPress,
}: {
  item: TabItem<T>;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        paddingHorizontal: t.space[3],
        paddingVertical: t.space[3],
        borderBottomWidth: 2,
        borderBottomColor: active ? t.tone.brand.solid : 'transparent',
        marginBottom: -t.borderWidth.thin,
      }}
    >
      {item.icon ? (
        <Icon name={item.icon} size="sm" color={active ? t.tone.brand.solid : t.color.textMuted} />
      ) : null}
      <Text
        variant="label"
        weight={active ? 'semibold' : 'medium'}
        style={{ color: active ? t.color.text : hovered ? t.color.text : t.color.textMuted }}
      >
        {item.label}
      </Text>
      {item.count !== undefined ? (
        <View
          style={{
            paddingHorizontal: t.space[1.5],
            borderRadius: t.radius.full,
            backgroundColor: active ? t.tone.brand.surface : t.color.surfaceSunken,
          }}
        >
          <Text
            variant="overline"
            style={{ color: active ? t.tone.brand.onSurface : t.color.textMuted }}
          >
            {item.count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ------------------------------------------------------------- page header */

export type PageHeaderProps = {
  title: string;
  description?: string;
  /** Right-aligned actions, usually one primary button plus secondaries. */
  actions?: ReactNode;
  /** Rendered under the title row — filters, tabs or search. */
  children?: ReactNode;
};

export function PageHeader({ title, description, actions, children }: PageHeaderProps) {
  const t = useTheme();

  return (
    <View style={{ gap: t.space[5] }}>
      <Row align="flex-start" justify="space-between" gap={4} wrap>
        <View style={{ gap: t.space[1], flexShrink: 1 }}>
          <Text variant="h1">{title}</Text>
          {description ? (
            <Text variant="body" tone="muted">
              {description}
            </Text>
          ) : null}
        </View>
        {actions ? (
          <Row gap={2} wrap>
            {actions}
          </Row>
        ) : null}
      </Row>
      {children}
    </View>
  );
}

/* ----------------------------------------------------------------- divider */

export function Divider({
  vertical = false,
  style,
}: {
  vertical?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        vertical
          ? { width: t.borderWidth.thin, alignSelf: 'stretch', backgroundColor: t.color.border }
          : { height: t.borderWidth.thin, alignSelf: 'stretch', backgroundColor: t.color.border },
        style,
      ]}
    />
  );
}

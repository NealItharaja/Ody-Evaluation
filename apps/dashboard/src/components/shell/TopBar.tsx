import { Badge, IconButton, Input, Row, Text, useBreakpoint, useTheme } from '@ody/shared';
import { View } from 'react-native';

type TopBarProps = {
  title: string;
  /** Shown on compact widths to open the nav drawer. */
  onOpenNav?: () => void;
  onToggleCollapse?: () => void;
};

export function TopBar({ title, onOpenNav, onToggleCollapse }: TopBarProps) {
  const t = useTheme();
  const { breakpoint } = useBreakpoint();
  const showSearch = breakpoint === 'lg' || breakpoint === 'xl';

  return (
    <Row
      justify="space-between"
      gap={4}
      style={{
        height: t.layout.topBarHeight,
        paddingHorizontal: t.space[6],
        backgroundColor: t.color.surface,
        borderBottomWidth: t.borderWidth.thin,
        borderBottomColor: t.color.border,
      }}
    >
      <Row gap={3} flex={1}>
        {onOpenNav ? (
          <IconButton icon="menu" accessibilityLabel="Open navigation" onPress={onOpenNav} />
        ) : null}
        {onToggleCollapse ? (
          <IconButton
            icon="sidebar"
            accessibilityLabel="Toggle navigation width"
            onPress={onToggleCollapse}
          />
        ) : null}
        <Text variant="h3" numberOfLines={1}>
          {title}
        </Text>
        <Badge label="Service open" tone="success" dot />
      </Row>

      <Row gap={2}>
        {showSearch ? (
          <View style={{ width: 260 }}>
            <Input
              placeholder="Search orders, customers…"
              iconLeft="search"
              size="sm"
              accessibilityLabel="Global search"
            />
          </View>
        ) : (
          <IconButton icon="search" accessibilityLabel="Search" />
        )}
        <IconButton icon="bell" accessibilityLabel="Notifications" />
      </Row>
    </Row>
  );
}

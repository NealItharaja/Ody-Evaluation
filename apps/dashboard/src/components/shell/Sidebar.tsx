import { Column, Divider, Icon, NavItem, Row, Text, useTheme } from '@ody/shared';
import { Link, usePathname } from 'expo-router';
import { View } from 'react-native';

import { NAV_ROUTES, SECTION_LABELS, type NavRoute } from '@/navigation/routes';

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

/** Persistent dark sidebar. Purely presentational — route state comes from the router. */
export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const t = useTheme();
  const pathname = usePathname();

  const sections = groupBySection(NAV_ROUTES);

  return (
    <View
      style={{
        width: collapsed ? t.layout.sidebarCollapsedWidth : t.layout.sidebarWidth,
        backgroundColor: t.color.chrome,
        paddingVertical: t.space[5],
        paddingHorizontal: t.space[3],
        gap: t.space[6],
      }}
    >
      <Row
        gap={3}
        style={{ paddingHorizontal: t.space[2] }}
        justify={collapsed ? 'center' : 'flex-start'}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: t.radius.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.tone.brand.solid,
          }}
        >
          <Icon name="award" size="md" color={t.color.textInverse} />
        </View>
        {collapsed ? null : (
          <View>
            <Text variant="h4" tone="inverse">
              Odyssey
            </Text>
            <Text variant="caption" tone="onChromeMuted">
              Rosemary & Vine
            </Text>
          </View>
        )}
      </Row>

      <Column gap={6} flex={1}>
        {sections.map(([section, routes]) => (
          <Column key={section} gap={1}>
            {collapsed ? null : (
              <Text
                variant="overline"
                tone="onChromeMuted"
                style={{ paddingHorizontal: t.space[3], marginBottom: t.space[1] }}
              >
                {SECTION_LABELS[section].toUpperCase()}
              </Text>
            )}
            {routes.map((route) => (
              <Link key={route.href} href={route.href} asChild onPress={onNavigate}>
                <NavItem
                  label={route.label}
                  icon={route.icon}
                  collapsed={collapsed}
                  active={isActive(pathname, route.href)}
                />
              </Link>
            ))}
          </Column>
        ))}
      </Column>

      <Column gap={3}>
        <Divider style={{ backgroundColor: t.color.chromeHover }} />
        <Row
          gap={3}
          style={{ paddingHorizontal: t.space[2] }}
          justify={collapsed ? 'center' : 'flex-start'}
        >
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: t.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.color.chromeHover,
            }}
          >
            <Text variant="caption" weight="semibold" tone="onChrome">
              NA
            </Text>
          </View>
          {collapsed ? null : (
            <View style={{ flex: 1 }}>
              <Text variant="label" tone="onChrome">
                Neal A.
              </Text>
              <Text variant="caption" tone="onChromeMuted">
                Store manager
              </Text>
            </View>
          )}
        </Row>
      </Column>
    </View>
  );
}

function isActive(pathname: string, href: NavRoute['href']): boolean {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function groupBySection(routes: readonly NavRoute[]): Array<[NavRoute['section'], NavRoute[]]> {
  const groups = new Map<NavRoute['section'], NavRoute[]>();
  for (const route of routes) {
    const existing = groups.get(route.section);
    if (existing) existing.push(route);
    else groups.set(route.section, [route]);
  }
  return Array.from(groups.entries());
}

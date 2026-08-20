import { useBreakpoint, useTheme } from '@ody/shared';
import { usePathname } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { NAV_ROUTES } from '@/navigation/routes';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/**
 * Dashboard chrome: persistent sidebar on wide screens, slide-over drawer on
 * compact ones, with the scrolling page content constrained to the grid width.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const t = useTheme();
  const pathname = usePathname();
  const { isCompact } = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = NAV_ROUTES.find((route) => route.href === pathname)?.label ?? 'Dashboard';

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.color.canvas }}>
      {isCompact ? null : <Sidebar collapsed={collapsed} />}

      <View style={{ flex: 1, minWidth: 0 }}>
        <TopBar
          title={title}
          onOpenNav={isCompact ? () => setDrawerOpen(true) : undefined}
          onToggleCollapse={isCompact ? undefined : () => setCollapsed((value) => !value)}
        />
        <ScrollView
          contentContainerStyle={{
            padding: isCompact ? t.layout.pageGutterCompact : t.layout.pageGutter,
            paddingBottom: t.space[16],
            maxWidth: t.layout.contentMaxWidth,
            width: '100%',
            alignSelf: 'center',
          }}
        >
          {children}
        </ScrollView>
      </View>

      <Modal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.color.overlay }}>
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
          <Pressable
            style={{ flex: 1 }}
            accessibilityLabel="Close navigation"
            onPress={() => setDrawerOpen(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

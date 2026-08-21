import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import { IconButton } from './Button';
import { Row } from './layout';
import { Text } from './Text';

export type DialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Action row pinned to the bottom of the panel. */
  footer?: ReactNode;
  width?: number;
  /** On compact widths a drawer reads better than a centered modal. */
  presentation?: 'auto' | 'modal' | 'drawer';
};

/**
 * Single dialog primitive used for every create/edit flow. It switches between
 * a centered modal and a right-side drawer so compact screens stay usable.
 */
export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
  width = 520,
  presentation = 'auto',
}: DialogProps) {
  const t = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const isDrawer =
    presentation === 'drawer' || (presentation === 'auto' && windowWidth < t.layout.breakpoints.md);

  const panelWidth = isDrawer
    ? Math.min(windowWidth, 460)
    : Math.min(width, windowWidth - t.space[8]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isDrawer ? 'slide' : 'fade'}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: t.color.overlay,
          justifyContent: isDrawer ? 'flex-start' : 'center',
          alignItems: isDrawer ? 'flex-end' : 'center',
          padding: isDrawer ? 0 : t.space[6],
        }}
      >
        {/* Backdrop press target sits behind the panel. */}
        <Pressable
          onPress={onClose}
          accessibilityLabel="Dismiss dialog"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <View
          accessibilityViewIsModal
          style={[
            {
              width: panelWidth,
              maxHeight: isDrawer ? windowHeight : windowHeight - t.space[16],
              height: isDrawer ? windowHeight : undefined,
              backgroundColor: t.color.surface,
              borderRadius: isDrawer ? 0 : t.radius.xl,
              borderWidth: t.borderWidth.thin,
              borderColor: t.color.border,
              overflow: 'hidden',
            },
            t.elevation[4] as ViewStyle,
          ]}
        >
          <Row
            align="flex-start"
            gap={4}
            style={{
              paddingHorizontal: t.space[6],
              paddingTop: t.space[5],
              paddingBottom: t.space[4],
              borderBottomWidth: t.borderWidth.thin,
              borderBottomColor: t.color.border,
            }}
          >
            <View style={{ flex: 1, gap: t.space[1] }}>
              <Text variant="h2">{title}</Text>
              {description ? (
                <Text variant="bodySm" tone="muted">
                  {description}
                </Text>
              ) : null}
            </View>
            <IconButton icon="x" accessibilityLabel="Close" onPress={onClose} size="sm" />
          </Row>

          <ScrollView
            contentContainerStyle={{ padding: t.space[6], gap: t.space[5] }}
            style={{ flexGrow: 0 }}
          >
            {children}
          </ScrollView>

          {footer ? (
            <Row
              justify="flex-end"
              gap={3}
              style={{
                paddingHorizontal: t.space[6],
                paddingVertical: t.space[4],
                borderTopWidth: t.borderWidth.thin,
                borderTopColor: t.color.border,
                backgroundColor: t.color.surfaceSunken,
              }}
            >
              {footer}
            </Row>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

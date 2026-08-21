import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import { Field } from './Field';
import { Icon, type IconName } from './Icon';
import { Row } from './layout';
import { Text } from './Text';

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = {
  options: readonly SelectOption<T>[];
  value?: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  iconLeft?: IconName;
  style?: StyleProp<ViewStyle>;
};

type Anchor = { x: number; y: number; width: number; height: number };

const PANEL_MAX_HEIGHT = 280;

/**
 * Cross-platform select. Renders a measured popover anchored to the trigger
 * rather than a native picker, so web and native look identical.
 */
export function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  label,
  hint,
  error,
  required,
  size = 'md',
  disabled = false,
  iconLeft,
  style,
}: SelectProps<T>) {
  const t = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const selected = options.find((option) => option.value === value) ?? null;
  const open = anchor !== null;

  const openPanel = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) =>
      setAnchor({ x, y, width, height }),
    );
  };

  const invalid = Boolean(error);
  const borderColor = invalid
    ? t.tone.danger.solid
    : open || focused
      ? t.color.borderFocus
      : hovered && !disabled
        ? t.color.borderStrong
        : t.color.border;

  // Flip the panel above the trigger when there is not enough room below.
  const spaceBelow = anchor ? windowHeight - (anchor.y + anchor.height) : 0;
  const flipUp = anchor
    ? spaceBelow < Math.min(PANEL_MAX_HEIGHT, 200) && anchor.y > spaceBelow
    : false;

  return (
    <Field label={label} hint={hint} error={error} required={required} style={style}>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          disabled={disabled}
          onPress={openPanel}
          onHoverIn={() => setHovered(true)}
          onHoverOut={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityRole="button"
          accessibilityState={{ disabled, expanded: open }}
          accessibilityLabel={label ?? placeholder}
          style={
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space[2],
              height: t.layout.controlHeight[size],
              paddingHorizontal: t.space[3],
              backgroundColor: disabled ? t.color.surfaceSunken : t.color.surface,
              borderWidth: t.borderWidth.thin,
              borderColor,
              borderRadius: t.radius.md,
              ...(focused || open
                ? {
                    outlineWidth: 3,
                    outlineColor: invalid ? t.tone.danger.border : t.color.focusRing,
                    outlineStyle: 'solid',
                  }
                : {}),
            } as ViewStyle
          }
        >
          {(iconLeft ?? selected?.icon) ? (
            <Icon
              name={(iconLeft ?? selected?.icon) as IconName}
              size="sm"
              color={t.color.textMuted}
            />
          ) : null}
          <Text
            variant="body"
            tone={selected ? 'default' : 'placeholder'}
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {selected?.label ?? placeholder}
          </Text>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size="sm" color={t.color.textMuted} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setAnchor(null)}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setAnchor(null)}
          accessibilityLabel="Close menu"
        >
          {anchor ? (
            <View
              style={[
                {
                  position: 'absolute',
                  left: Math.min(anchor.x, Math.max(0, windowWidth - anchor.width - t.space[4])),
                  width: Math.max(anchor.width, 200),
                  maxHeight: PANEL_MAX_HEIGHT,
                  backgroundColor: t.color.surface,
                  borderRadius: t.radius.lg,
                  borderWidth: t.borderWidth.thin,
                  borderColor: t.color.border,
                  paddingVertical: t.space[1],
                  overflow: 'hidden',
                },
                flipUp
                  ? { bottom: windowHeight - anchor.y + t.space[1] }
                  : { top: anchor.y + anchor.height + t.space[1] },
                t.elevation[3] as ViewStyle,
              ]}
            >
              <ScrollView keyboardShouldPersistTaps="handled">
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    option={option}
                    active={option.value === value}
                    onSelect={() => {
                      onChange(option.value);
                      setAnchor(null);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </Field>
  );
}

function SelectItem<T extends string>({
  option,
  active,
  onSelect,
}: {
  option: SelectOption<T>;
  active: boolean;
  onSelect: () => void;
}) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      disabled={option.disabled}
      onPress={onSelect}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: active, disabled: option.disabled }}
      style={{
        paddingHorizontal: t.space[3],
        paddingVertical: t.space[2],
        marginHorizontal: t.space[1],
        borderRadius: t.radius.sm,
        backgroundColor: hovered && !option.disabled ? t.color.surfaceHover : 'transparent',
        opacity: option.disabled ? t.opacity.disabled : 1,
      }}
    >
      <Row gap={2}>
        {option.icon ? <Icon name={option.icon} size="sm" color={t.color.textSecondary} /> : null}
        <View style={{ flex: 1 }}>
          <Text variant="body" weight={active ? 'semibold' : 'regular'}>
            {option.label}
          </Text>
          {option.description ? (
            <Text variant="caption" tone="muted">
              {option.description}
            </Text>
          ) : null}
        </View>
        {active ? <Icon name="check" size="sm" color={t.tone.brand.solid} /> : null}
      </Row>
    </Pressable>
  );
}

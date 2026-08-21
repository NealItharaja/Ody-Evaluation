import { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Text } from './Text';

export type SwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TRACK_WIDTH = 40;
const TRACK_HEIGHT = 22;
const THUMB = 18;

/** Toggle with an optional label/description row — the Settings workhorse. */
export function Switch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
}: SwitchProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  const control = (
    <View
      style={
        {
          width: TRACK_WIDTH,
          height: TRACK_HEIGHT,
          borderRadius: t.radius.full,
          backgroundColor: value ? t.tone.brand.solid : t.color.borderStrong,
          padding: (TRACK_HEIGHT - THUMB) / 2,
          justifyContent: 'center',
          alignItems: value ? 'flex-end' : 'flex-start',
          ...(focused && !disabled
            ? {
                outlineWidth: 3,
                outlineColor: t.color.focusRing,
                outlineStyle: 'solid',
                outlineOffset: 1,
              }
            : {}),
        } as ViewStyle
      }
    >
      <View
        style={[
          {
            width: THUMB,
            height: THUMB,
            borderRadius: t.radius.full,
            backgroundColor: t.color.surface,
          },
          t.elevation[1] as ViewStyle,
        ]}
      />
    </View>
  );

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: t.space[3],
          opacity: disabled ? t.opacity.disabled : 1,
        },
        style,
      ]}
    >
      {label || description ? (
        <View style={{ flex: 1, gap: t.space[0.5] }}>
          {label ? <Text variant="label">{label}</Text> : null}
          {description ? (
            <Text variant="caption" tone="muted">
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
      {control}
    </Pressable>
  );
}

export type CheckboxProps = Omit<SwitchProps, 'value' | 'onValueChange'> & {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
};

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  style,
}: CheckboxProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onCheckedChange(!checked)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: t.space[2],
          opacity: disabled ? t.opacity.disabled : 1,
        },
        style,
      ]}
    >
      <View
        style={
          {
            width: 18,
            height: 18,
            borderRadius: t.radius.sm,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: checked ? t.tone.brand.solid : t.color.surface,
            borderWidth: t.borderWidth.thin,
            borderColor: checked ? t.tone.brand.solid : t.color.borderStrong,
            ...(focused && !disabled
              ? {
                  outlineWidth: 3,
                  outlineColor: t.color.focusRing,
                  outlineStyle: 'solid',
                  outlineOffset: 1,
                }
              : {}),
          } as ViewStyle
        }
      >
        {checked ? <Icon name="check" size="xs" color={t.tone.brand.onSolid} /> : null}
      </View>
      {label || description ? (
        <View style={{ flex: 1, gap: t.space[0.5] }}>
          {label ? <Text variant="label">{label}</Text> : null}
          {description ? (
            <Text variant="caption" tone="muted">
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

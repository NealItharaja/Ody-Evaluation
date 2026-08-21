import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import type { SemanticTone } from '../theme/theme';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

type VisualState = { hovered: boolean; pressed: boolean; focused: boolean };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...rest
}: ButtonProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isInactive = disabled || loading;
  const height = t.layout.controlHeight[size];
  const paddingHorizontal = size === 'sm' ? t.space[3] : size === 'lg' ? t.space[5] : t.space[4];
  const textVariant = size === 'lg' ? 'h4' : 'label';
  const iconSize = size === 'sm' ? 'sm' : 'md';

  const visual = (state: VisualState) => resolveVisual(t, variant, state, isInactive);

  return (
    <Pressable
      {...rest}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        const v = visual({ hovered, pressed, focused });
        return [
          {
            height,
            paddingHorizontal,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: t.space[2],
            borderRadius: t.radius.md,
            backgroundColor: v.background,
            borderWidth: t.borderWidth.thin,
            borderColor: v.border,
            opacity: isInactive ? t.opacity.disabled : 1,
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            ...(focused && !isInactive
              ? {
                  outlineWidth: 2,
                  outlineColor: t.color.focusRing,
                  outlineStyle: 'solid',
                  outlineOffset: 2,
                }
              : {}),
          } as ViewStyle,
          variant === 'primary' || variant === 'danger' ? (t.elevation[1] as ViewStyle) : null,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const v = visual({ hovered, pressed, focused });
        return (
          <>
            {loading ? (
              <ActivityIndicator size="small" color={v.foreground} />
            ) : iconLeft ? (
              <Icon name={iconLeft} size={iconSize} color={v.foreground} />
            ) : null}
            <Text variant={textVariant} style={{ color: v.foreground }} numberOfLines={1}>
              {label}
            </Text>
            {iconRight && !loading ? (
              <Icon name={iconRight} size={iconSize} color={v.foreground} />
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}

function resolveVisual(
  t: ReturnType<typeof useTheme>,
  variant: ButtonVariant,
  { hovered, pressed }: VisualState,
  inactive: boolean,
): { background: string; border: string; foreground: string } {
  const interactive = !inactive && (hovered || pressed);

  switch (variant) {
    case 'primary':
      return {
        background: interactive ? t.tone.brand.solidHover : t.tone.brand.solid,
        border: interactive ? t.tone.brand.solidHover : t.tone.brand.solid,
        foreground: t.tone.brand.onSolid,
      };
    case 'danger':
      return {
        background: interactive ? t.tone.danger.solidHover : t.tone.danger.solid,
        border: interactive ? t.tone.danger.solidHover : t.tone.danger.solid,
        foreground: t.tone.danger.onSolid,
      };
    case 'secondary':
      return {
        background: pressed
          ? t.color.surfacePressed
          : hovered
            ? t.color.surfaceHover
            : t.color.surface,
        border: hovered && !inactive ? t.color.borderStrong : t.color.border,
        foreground: t.color.text,
      };
    case 'soft':
      return {
        background: interactive ? t.tone.brand.border : t.tone.brand.surface,
        border: 'transparent',
        foreground: t.tone.brand.onSurface,
      };
    case 'ghost':
    default:
      return {
        background: pressed
          ? t.color.surfacePressed
          : hovered
            ? t.color.surfaceHover
            : 'transparent',
        border: 'transparent',
        foreground: t.color.textSecondary,
      };
  }
}

export type IconButtonProps = Omit<ButtonProps, 'label' | 'iconLeft' | 'iconRight'> & {
  icon: IconName;
  /** Required for a11y since there is no visible text. */
  accessibilityLabel: string;
  tone?: SemanticTone;
};

export function IconButton({
  icon,
  accessibilityLabel,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  ...rest
}: IconButtonProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const isInactive = disabled || loading;
  const dimension = t.layout.controlHeight[size];

  return (
    <Pressable
      {...rest}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isInactive }}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => {
        const v = resolveVisual(t, variant, { hovered, pressed, focused }, isInactive);
        return [
          {
            width: dimension,
            height: dimension,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: t.radius.md,
            backgroundColor: v.background,
            borderWidth: t.borderWidth.thin,
            borderColor: v.border,
            opacity: isInactive ? t.opacity.disabled : 1,
            ...(focused && !isInactive
              ? {
                  outlineWidth: 2,
                  outlineColor: t.color.focusRing,
                  outlineStyle: 'solid',
                  outlineOffset: 2,
                }
              : {}),
          } as ViewStyle,
          style,
        ];
      }}
    >
      {({ pressed }) => {
        const v = resolveVisual(t, variant, { hovered, pressed, focused }, isInactive);
        return loading ? (
          <ActivityIndicator size="small" color={v.foreground} />
        ) : (
          <View>
            <Icon name={icon} size={size === 'sm' ? 'sm' : 'md'} color={v.foreground} />
          </View>
        );
      }}
    </Pressable>
  );
}

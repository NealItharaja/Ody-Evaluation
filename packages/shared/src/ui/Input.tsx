import { useState } from 'react';
import {
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme';
import { Field } from './Field';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: IconName;
  /** Static suffix such as a currency code or unit. */
  suffix?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function Input({
  label,
  hint,
  error,
  required,
  size = 'md',
  iconLeft,
  suffix,
  disabled = false,
  multiline,
  containerStyle,
  inputStyle,
  ...rest
}: InputProps) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const invalid = Boolean(error);
  const borderColor = invalid
    ? t.tone.danger.solid
    : focused
      ? t.color.borderFocus
      : hovered && !disabled
        ? t.color.borderStrong
        : t.color.border;

  return (
    <Field label={label} hint={hint} error={error} required={required} style={containerStyle}>
      <View
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        style={
          {
            flexDirection: 'row',
            alignItems: multiline ? 'flex-start' : 'center',
            gap: t.space[2],
            minHeight: multiline ? 96 : t.layout.controlHeight[size],
            paddingHorizontal: t.space[3],
            paddingVertical: multiline ? t.space[2] : 0,
            backgroundColor: disabled ? t.color.surfaceSunken : t.color.surface,
            borderWidth: t.borderWidth.thin,
            borderColor,
            borderRadius: t.radius.md,
            ...(focused
              ? {
                  outlineWidth: 3,
                  outlineColor: invalid ? t.tone.danger.border : t.color.focusRing,
                  outlineStyle: 'solid',
                  outlineOffset: 0,
                }
              : {}),
          } as ViewStyle
        }
      >
        {iconLeft ? <Icon name={iconLeft} size="sm" color={t.color.textMuted} /> : null}
        <TextInput
          {...rest}
          multiline={multiline}
          editable={!disabled}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={t.color.textPlaceholder}
          style={[
            {
              flex: 1,
              paddingVertical: 0,
              color: disabled ? t.color.textMuted : t.color.text,
              fontFamily: t.typography.fontFamily,
              fontSize: t.typography.variants.body.fontSize,
              lineHeight: multiline ? t.typography.variants.body.lineHeight : undefined,
              // Native focus ring is handled by the wrapper above.
              outlineWidth: 0,
            } as TextStyle,
            inputStyle,
          ]}
        />
        {suffix ? (
          <Text variant="bodySm" tone="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
    </Field>
  );
}

export type TextareaProps = Omit<InputProps, 'multiline'>;

export function Textarea(props: TextareaProps) {
  return <Input {...props} multiline textAlignVertical="top" />;
}

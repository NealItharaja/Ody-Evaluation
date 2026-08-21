import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Row } from './layout';
import { Text } from './Text';

export type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Owns the label / hint / error layout for every form control so validation
 * messaging looks identical across the product.
 */
export function Field({ label, hint, error, required = false, children, style }: FieldProps) {
  const t = useTheme();

  return (
    <View style={[{ gap: t.space[1.5] }, style]}>
      {label ? (
        <Row gap={1}>
          <Text variant="label" tone="secondary">
            {label}
          </Text>
          {required ? (
            <Text variant="label" tone="danger">
              *
            </Text>
          ) : null}
        </Row>
      ) : null}
      {children}
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

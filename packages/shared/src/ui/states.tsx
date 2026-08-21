import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme';
import type { SemanticTone } from '../theme/theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Row } from './layout';
import { Text } from './Text';

/* ------------------------------------------------------------- empty state */

export type EmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  /** `inline` fits inside a card body, `page` centers in the viewport. */
  size?: 'inline' | 'page';
};

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  size = 'inline',
}: EmptyStateProps) {
  const t = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[3],
        paddingVertical: size === 'page' ? t.space[20] : t.space[12],
        paddingHorizontal: t.space[6],
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: t.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.color.surfaceSunken,
          borderWidth: t.borderWidth.thin,
          borderColor: t.color.border,
        }}
      >
        <Icon name={icon} size="lg" color={t.color.textMuted} />
      </View>
      <View style={{ gap: t.space[1], alignItems: 'center', maxWidth: 380 }}>
        <Text variant="h3">{title}</Text>
        {description ? (
          <Text variant="bodySm" tone="muted" align="center">
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}

/* ------------------------------------------------------------- error state */

export type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  size?: 'inline' | 'page';
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this data. Try again in a moment.',
  onRetry,
  size = 'inline',
}: ErrorStateProps) {
  const t = useTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space[3],
        paddingVertical: size === 'page' ? t.space[20] : t.space[12],
        paddingHorizontal: t.space[6],
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: t.radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.tone.danger.surface,
          borderWidth: t.borderWidth.thin,
          borderColor: t.tone.danger.border,
        }}
      >
        <Icon name="alert-triangle" size="lg" color={t.tone.danger.solid} />
      </View>
      <View style={{ gap: t.space[1], alignItems: 'center', maxWidth: 380 }}>
        <Text variant="h3">{title}</Text>
        <Text variant="bodySm" tone="muted" align="center">
          {description}
        </Text>
      </View>
      {onRetry ? (
        <Button label="Try again" variant="secondary" iconLeft="refresh-cw" onPress={onRetry} />
      ) : null}
    </View>
  );
}

/* ----------------------------------------------------------------- callout */

export type CalloutProps = {
  tone?: SemanticTone;
  title: string;
  description?: string;
  icon?: IconName;
  action?: ReactNode;
};

const toneIcon: Record<SemanticTone, IconName> = {
  neutral: 'info',
  brand: 'info',
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  danger: 'alert-octagon',
};

/** Inline banner for form-level errors, warnings and confirmations. */
export function Callout({ tone = 'info', title, description, icon, action }: CalloutProps) {
  const t = useTheme();
  const ramp = t.tone[tone];

  return (
    <Row
      align="flex-start"
      gap={3}
      style={{
        backgroundColor: ramp.surface,
        borderColor: ramp.border,
        borderWidth: t.borderWidth.thin,
        borderRadius: t.radius.lg,
        padding: t.space[4],
      }}
    >
      <Icon name={icon ?? toneIcon[tone]} size="md" color={ramp.solid} />
      <View style={{ flex: 1, gap: t.space[1] }}>
        <Text variant="label" style={{ color: ramp.onSurface }}>
          {title}
        </Text>
        {description ? (
          <Text variant="bodySm" style={{ color: ramp.onSurface }}>
            {description}
          </Text>
        ) : null}
      </View>
      {action}
    </Row>
  );
}

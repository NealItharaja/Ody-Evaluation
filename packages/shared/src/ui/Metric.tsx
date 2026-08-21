import { View } from 'react-native';

import { useTheme } from '../theme';
import type { SemanticTone } from '../theme/theme';
import { Icon, type IconName } from './Icon';
import { Row } from './layout';
import { SkeletonMetric } from './Skeleton';
import { Surface } from './Surface';
import { Text } from './Text';

export type MetricProps = {
  label: string;
  value: string;
  /** Signed delta vs the previous period, e.g. "+12.4%". */
  delta?: { value: string; direction: 'up' | 'down' | 'flat' };
  hint?: string;
  icon?: IconName;
  tone?: SemanticTone;
  loading?: boolean;
};

const deltaTone: Record<'up' | 'down' | 'flat', SemanticTone> = {
  up: 'success',
  down: 'danger',
  flat: 'neutral',
};

const deltaIcon: Record<'up' | 'down' | 'flat', IconName> = {
  up: 'trending-up',
  down: 'trending-down',
  flat: 'minus',
};

/** KPI tile for the Home dashboard. */
export function Metric({
  label,
  value,
  delta,
  hint,
  icon,
  tone = 'brand',
  loading = false,
}: MetricProps) {
  const t = useTheme();
  const ramp = t.tone[tone];

  return (
    <Surface
      padding={5}
      radius="lg"
      elevation={1}
      style={{ minHeight: 132, justifyContent: 'space-between' }}
    >
      {loading ? (
        <SkeletonMetric />
      ) : (
        <>
          <Row justify="space-between" align="flex-start" gap={3}>
            <Text variant="label" tone="muted">
              {label}
            </Text>
            {icon ? (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: t.radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: ramp.surface,
                }}
              >
                <Icon name={icon} size="md" color={ramp.solid} />
              </View>
            ) : null}
          </Row>
          <View style={{ gap: t.space[1], marginTop: t.space[4] }}>
            <Text variant="metric" tabular>
              {value}
            </Text>
            <Row gap={2}>
              {delta ? (
                <Row gap={1}>
                  <Icon
                    name={deltaIcon[delta.direction]}
                    size="xs"
                    color={t.tone[deltaTone[delta.direction]].solid}
                  />
                  <Text
                    variant="caption"
                    weight="semibold"
                    style={{ color: t.tone[deltaTone[delta.direction]].onSurface }}
                  >
                    {delta.value}
                  </Text>
                </Row>
              ) : null}
              {hint ? (
                <Text variant="caption" tone="muted">
                  {hint}
                </Text>
              ) : null}
            </Row>
          </View>
        </>
      )}
    </Surface>
  );
}

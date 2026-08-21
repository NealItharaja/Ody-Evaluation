import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';
import { Icon } from './Icon';
import { Row } from './layout';
import { SkeletonRows } from './Skeleton';
import { EmptyState, ErrorState, type EmptyStateProps } from './states';
import { Text } from './Text';

export type TableColumn<T> = {
  id: string;
  header: string;
  /** Fixed pixel width. Use for compact columns like status or actions. */
  width?: number;
  /** Flex grow weight when `width` is not set. */
  flex?: number;
  align?: 'left' | 'right' | 'center';
  render: (row: T, index: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: readonly TableColumn<T>[];
  data: readonly T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onRowPress?: (row: T) => void;
  empty?: EmptyStateProps;
  /** Minimum table width before horizontal scrolling kicks in. */
  minWidth?: number;
};

/**
 * Table primitive that owns its own loading, error and empty presentation so
 * every list screen handles those states the same way.
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  error,
  onRetry,
  onRowPress,
  empty,
  minWidth = 720,
}: DataTableProps<T>) {
  const t = useTheme();

  const body = () => {
    if (loading) return <SkeletonRows rows={6} columns={Math.min(columns.length, 5)} />;
    if (error) return <ErrorState onRetry={onRetry} />;
    if (data.length === 0)
      return <EmptyState {...(empty ?? { title: 'Nothing here yet', icon: 'inbox' })} />;

    return data.map((row, index) => (
      <TableRow
        key={keyExtractor(row)}
        columns={columns}
        row={row}
        index={index}
        isLast={index === data.length - 1}
        onPress={onRowPress}
      />
    ));
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ minWidth: '100%' }}
    >
      <View style={{ minWidth, flex: 1 }}>
        <Row
          style={{
            paddingHorizontal: t.space[5],
            paddingVertical: t.space[3],
            backgroundColor: t.color.surfaceSunken,
            borderBottomWidth: t.borderWidth.thin,
            borderBottomColor: t.color.border,
          }}
        >
          {columns.map((column) => (
            <View key={column.id} style={cellStyle(column)}>
              <Text variant="overline" tone="muted" align={column.align ?? 'left'}>
                {column.header.toUpperCase()}
              </Text>
            </View>
          ))}
        </Row>
        {body()}
      </View>
    </ScrollView>
  );
}

function cellStyle<T>(column: TableColumn<T>): ViewStyle {
  return column.width !== undefined
    ? { width: column.width, paddingRight: 12 }
    : { flex: column.flex ?? 1, minWidth: 0, paddingRight: 12 };
}

function TableRow<T>({
  columns,
  row,
  index,
  isLast,
  onPress,
}: {
  columns: readonly TableColumn<T>[];
  row: T;
  index: number;
  isLast: boolean;
  onPress?: (row: T) => void;
}) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  const interactive = Boolean(onPress);

  return (
    <Pressable
      disabled={!interactive}
      onPress={() => onPress?.(row)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole={interactive ? 'button' : undefined}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: t.space[5],
        paddingVertical: t.space[4],
        borderBottomWidth: isLast ? 0 : t.borderWidth.thin,
        borderBottomColor: t.color.border,
        backgroundColor: interactive && hovered ? t.color.surfaceHover : 'transparent',
      }}
    >
      {columns.map((column) => (
        <View key={column.id} style={cellStyle(column)}>
          {column.render(row, index)}
        </View>
      ))}
      {interactive ? (
        <View style={{ position: 'absolute', right: t.space[4], opacity: hovered ? 1 : 0 }}>
          <Icon name="chevron-right" size="sm" color={t.color.textMuted} />
        </View>
      ) : null}
    </Pressable>
  );
}

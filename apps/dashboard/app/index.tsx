import {
  Badge,
  Button,
  Card,
  Column,
  DataTable,
  Grid,
  GridItem,
  Metric,
  PageHeader,
  Row,
  Text,
  formatMoney,
  formatMoneyCompact,
  formatRelativeTime,
  useTheme,
  type TableColumn,
} from '@ody/shared';
import type { OrderListItem } from '@ody/api-client';
import { useGetSummary } from '@ody/api-client';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { ORDER_STATUS_META } from '@/features/orders/status';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const summary = useGetSummary();

  const columns: TableColumn<OrderListItem>[] = [
    {
      id: 'reference',
      header: 'Order',
      flex: 1.1,
      render: (order) => (
        <View style={{ gap: 2 }}>
          <Text variant="label">{order.reference}</Text>
          <Text variant="caption" tone="muted">
            {order.customerName}
          </Text>
        </View>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      width: 132,
      render: (order) => {
        const meta = ORDER_STATUS_META[order.status];
        return <Badge label={meta.label} tone={meta.tone} dot />;
      },
    },
    {
      id: 'items',
      header: 'Items',
      width: 80,
      render: (order) => (
        <Text variant="body" tabular>
          {order.itemCount}
        </Text>
      ),
    },
    {
      id: 'total',
      header: 'Total',
      width: 110,
      render: (order) => (
        <Text variant="label" tabular>
          {formatMoney(order.totalCents)}
        </Text>
      ),
    },
    {
      id: 'placed',
      header: 'Placed',
      width: 130,
      render: (order) => (
        <Text variant="bodySm" tone="muted">
          {formatRelativeTime(order.createdAt)}
        </Text>
      ),
    },
  ];

  const data = summary.data;

  return (
    <Column gap={6}>
      <PageHeader
        title="Today at Rosemary & Vine"
        description="Live service overview from the ordering API."
        actions={
          <Button label="New order" iconLeft="plus" onPress={() => router.push('/orders')} />
        }
      />

      <Grid gap={5}>
        <GridItem minWidth={220}>
          <Metric
            label="Orders today"
            value={data ? String(data.ordersToday) : '—'}
            hint="in the location timezone"
            icon="clipboard"
            tone="brand"
            loading={summary.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Revenue"
            value={data ? formatMoneyCompact(data.revenueCents) : '—'}
            hint="completed orders"
            icon="dollar-sign"
            tone="success"
            loading={summary.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Open orders"
            value={data ? String(data.openOrders) : '—'}
            hint="in the pass"
            icon="clock"
            tone="warning"
            loading={summary.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Avg order value"
            value={data ? formatMoney(data.averageOrderCents) : '—'}
            hint="completed today"
            icon="trending-up"
            tone="info"
            loading={summary.isLoading}
          />
        </GridItem>
      </Grid>

      <Grid gap={5}>
        <GridItem minWidth={420} grow={2}>
          <Card
            title="Live orders"
            description="Everything currently in the pass, newest first."
            action={
              <Button
                label="All orders"
                variant="ghost"
                iconRight="arrow-right"
                onPress={() => router.push('/orders')}
              />
            }
            flush
          >
            <DataTable
              columns={columns}
              data={data?.liveOrders ?? []}
              keyExtractor={(order) => order.id}
              loading={summary.isLoading}
              error={summary.error}
              onRetry={() => void summary.refetch()}
              onRowPress={() => router.push('/orders')}
              minWidth={620}
              empty={{
                icon: 'coffee',
                title: 'No open orders',
                description: 'Every ticket is cleared. New orders will appear here instantly.',
              }}
            />
          </Card>
        </GridItem>

        <GridItem minWidth={300}>
          <Card title="Popular items" description="Top sellers from completed orders.">
            <Column gap={4}>
              {(data?.popularItems ?? []).map((item, index) => (
                <Row key={item.menuItemId} gap={3}>
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: t.radius.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: t.color.surfaceSunken,
                    }}
                  >
                    <Text variant="caption" weight="semibold" tone="secondary">
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="label" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {item.categoryName} · {item.quantitySold} sold
                    </Text>
                  </View>
                  <Text variant="label" tabular>
                    {formatMoney(item.priceCents)}
                  </Text>
                </Row>
              ))}
            </Column>
          </Card>
        </GridItem>
      </Grid>
    </Column>
  );
}

import {
  Badge,
  Button,
  Card,
  Column,
  DataTable,
  Dialog,
  Divider,
  Input,
  PageHeader,
  Row,
  Select,
  Surface,
  Tabs,
  Text,
  formatDateTime,
  formatMoney,
  formatRelativeTime,
  useBreakpoint,
  useTheme,
  useToast,
  type TableColumn,
} from '@ody/shared';
import type { OrderAction, OrderListItem } from '@ody/api-client';
import { useGetOrdersId, usePostOrdersIdActions } from '@ody/api-client';
import { useState } from 'react';
import { View } from 'react-native';

import { CreateOrderDialog } from '@/features/orders/CreateOrderDialog';
import {
  ORDER_ACTION_LABELS,
  ORDER_CHANNEL_LABELS,
  ORDER_STATUS_META,
} from '@/features/orders/status';
import { useOrderFilters, type OrderStatusFilter } from '@/features/orders/useOrderFilters';
import { errorMessage } from '@/lib/errorMessage';
import { useInvalidateOps } from '@/lib/useInvalidateOps';

export default function OrdersScreen() {
  const t = useTheme();
  const { isCompact } = useBreakpoint();
  const {
    filters,
    setStatus,
    setChannel,
    setSearch,
    reset,
    isFiltered,
    counts,
    orders,
    loading,
    error,
    refetch,
  } = useOrderFilters();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: TableColumn<OrderListItem>[] = [
    {
      id: 'reference',
      header: 'Order',
      flex: 1.2,
      render: (order) => (
        <View style={{ gap: 2 }}>
          <Text variant="label">{order.reference}</Text>
          <Text variant="caption" tone="muted">
            {formatDateTime(order.createdAt)}
          </Text>
        </View>
      ),
    },
    {
      id: 'customer',
      header: 'Customer',
      flex: 1.2,
      render: (order) => <Text variant="body">{order.customerName}</Text>,
    },
    {
      id: 'channel',
      header: 'Channel',
      width: 110,
      render: (order) => (
        <Text variant="bodySm" tone="secondary">
          {ORDER_CHANNEL_LABELS[order.channel]}
        </Text>
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
      width: 74,
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
  ];

  return (
    <Column gap={6}>
      <PageHeader
        title="Orders"
        description="Every ticket from every channel, in one queue."
        actions={
          <>
            <Button
              label="Refresh"
              variant="secondary"
              iconLeft="refresh-cw"
              onPress={() => void refetch()}
            />
            <Button label="New order" iconLeft="plus" onPress={() => setCreating(true)} />
          </>
        }
      >
        <Tabs<OrderStatusFilter>
          value={filters.status}
          onChange={setStatus}
          items={[
            { value: 'open', label: 'Open', count: counts.open },
            { value: 'all', label: 'All', count: counts.all },
            { value: 'completed', label: 'Completed', count: counts.completed },
            { value: 'cancelled', label: 'Cancelled', count: counts.cancelled },
          ]}
        />
      </PageHeader>

      <Card flush>
        <Row
          gap={3}
          wrap
          style={{
            paddingHorizontal: t.space[5],
            paddingVertical: t.space[4],
            borderBottomWidth: t.borderWidth.thin,
            borderBottomColor: t.color.border,
          }}
        >
          <View style={{ flex: 1, minWidth: 220 }}>
            <Input
              placeholder="Search by order ref or customer"
              iconLeft="search"
              size="sm"
              value={filters.search}
              onChangeText={setSearch}
            />
          </View>
          <View style={{ width: isCompact ? '100%' : 180 }}>
            <Select
              size="sm"
              value={filters.channel}
              onChange={setChannel}
              options={[
                { value: 'all', label: 'All channels' },
                { value: 'dine_in', label: 'Dine in' },
                { value: 'takeaway', label: 'Takeaway' },
                { value: 'delivery', label: 'Delivery' },
              ]}
            />
          </View>
          {isFiltered ? (
            <Button label="Clear" variant="ghost" size="sm" iconLeft="x" onPress={reset} />
          ) : null}
        </Row>

        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(order) => order.id}
          loading={loading}
          error={error}
          onRetry={() => void refetch()}
          onRowPress={(order) => setSelectedId(order.id)}
          empty={{
            icon: 'search',
            title: isFiltered ? 'No orders match these filters' : 'No orders yet',
            description: isFiltered
              ? 'Try widening the status or channel filter.'
              : 'Orders placed in-store or online will show up here.',
          }}
        />
      </Card>

      <OrderDetailDrawer orderId={selectedId} onClose={() => setSelectedId(null)} />
      <CreateOrderDialog visible={creating} onClose={() => setCreating(false)} />
    </Column>
  );
}

function OrderDetailDrawer({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const detail = useGetOrdersId(orderId ?? '', { query: { enabled: Boolean(orderId) } });
  const action = usePostOrdersIdActions();
  const order = detail.data;

  const run = (next: OrderAction) => {
    if (!orderId) return;
    action.mutate(
      { id: orderId, data: { action: next } },
      {
        onSuccess: (updated) => {
          toast.success(`Order ${ORDER_STATUS_META[updated.status].label.toLowerCase()}`);
          invalidate();
        },
        onError: (error) => toast.error('Status not changed', errorMessage(error)),
      },
    );
  };

  return (
    <Dialog
      visible={Boolean(orderId)}
      onClose={onClose}
      presentation="drawer"
      title={order?.reference ?? 'Order'}
      description={
        order ? `${order.customerName} · ${ORDER_CHANNEL_LABELS[order.channel]}` : 'Loading…'
      }
      footer={
        <>
          <Button label="Close" variant="secondary" onPress={onClose} />
          {(order?.allowedActions ?? []).map((next) => (
            <Button
              key={next}
              label={ORDER_ACTION_LABELS[next]}
              variant={next === 'cancel' ? 'danger' : 'primary'}
              loading={action.isPending}
              onPress={() => run(next)}
            />
          ))}
        </>
      }
    >
      {order ? (
        <>
          <Row justify="space-between">
            <Badge
              label={ORDER_STATUS_META[order.status].label}
              tone={ORDER_STATUS_META[order.status].tone}
              icon={ORDER_STATUS_META[order.status].icon}
            />
            <Text variant="caption" tone="muted">
              Placed {formatRelativeTime(order.createdAt)}
            </Text>
          </Row>

          <Column gap={3}>
            {order.items.map((item) => (
              <Row key={item.id} justify="space-between">
                <Text variant="body">
                  {item.quantity} × {item.nameSnapshot}
                </Text>
                <Text variant="label" tabular>
                  {formatMoney(item.lineTotalCents)}
                </Text>
              </Row>
            ))}
          </Column>

          <Surface variant="sunken" padding={4} radius="lg" bordered={false}>
            <Column gap={3}>
              <Row justify="space-between">
                <Text variant="bodySm" tone="muted">
                  Subtotal
                </Text>
                <Text variant="label" tabular>
                  {formatMoney(order.subtotalCents)}
                </Text>
              </Row>
              <Row justify="space-between">
                <Text variant="bodySm" tone="muted">
                  Tax
                </Text>
                <Text variant="label" tabular>
                  {formatMoney(order.taxCents)}
                </Text>
              </Row>
              <Divider />
              <Row justify="space-between">
                <Text variant="bodySm" tone="muted">
                  Order total
                </Text>
                <Text variant="h3" tabular>
                  {formatMoney(order.totalCents)}
                </Text>
              </Row>
            </Column>
          </Surface>
        </>
      ) : null}
    </Dialog>
  );
}

import {
  Avatar,
  Badge,
  Button,
  Card,
  Column,
  DataTable,
  Dialog,
  Divider,
  Grid,
  GridItem,
  Input,
  Metric,
  PageHeader,
  Row,
  Surface,
  Text,
  formatMoney,
  formatMoneyCompact,
  formatRelativeTime,
  pluralize,
  useTheme,
  type TableColumn,
} from '@ody/shared';
import type { CustomerListItem } from '@ody/api-client';
import { useGetCustomers, useGetCustomersId } from '@ody/api-client';
import { useState } from 'react';
import { View } from 'react-native';

export default function CrmScreen() {
  const t = useTheme();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = useGetCustomers({ search: search.trim() || undefined });

  const items = list.data?.items ?? [];
  const totalSpend = list.data?.lifetimeSpendCents ?? 0;
  const repeatRate = list.data?.repeatRate ?? 0;

  const columns: TableColumn<CustomerListItem>[] = [
    {
      id: 'customer',
      header: 'Customer',
      flex: 1.4,
      render: (customer) => (
        <Row gap={3}>
          <Avatar name={customer.name} size="sm" />
          <View style={{ flex: 1 }}>
            <Text variant="label" numberOfLines={1}>
              {customer.name}
            </Text>
            <Text variant="caption" tone="muted" numberOfLines={1}>
              {customer.email}
            </Text>
          </View>
        </Row>
      ),
    },
    {
      id: 'orders',
      header: 'Orders',
      width: 90,
      render: (customer) => (
        <Text variant="body" tabular>
          {customer.orderCount}
        </Text>
      ),
    },
    {
      id: 'spend',
      header: 'Lifetime spend',
      width: 140,
      render: (customer) => (
        <Text variant="label" tabular>
          {formatMoney(customer.lifetimeSpendCents)}
        </Text>
      ),
    },
    {
      id: 'aov',
      header: 'Avg order',
      width: 120,
      render: (customer) => (
        <Text variant="body" tone="secondary" tabular>
          {formatMoney(Math.round(customer.lifetimeSpendCents / Math.max(1, customer.orderCount)))}
        </Text>
      ),
    },
    {
      id: 'segment',
      header: 'Segment',
      width: 118,
      render: (customer) =>
        customer.orderCount >= 15 ? (
          <Badge label="Regular" tone="brand" />
        ) : customer.orderCount >= 5 ? (
          <Badge label="Returning" tone="info" />
        ) : (
          <Badge label="New" tone="neutral" />
        ),
    },
    {
      id: 'last',
      header: 'Last order',
      width: 130,
      render: (customer) => (
        <Text variant="bodySm" tone="muted">
          {customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : '—'}
        </Text>
      ),
    },
  ];

  return (
    <Column gap={6}>
      <PageHeader
        title="Customers"
        description="Who is eating with you, how often, and how much they spend."
      />

      <Grid gap={5}>
        <GridItem minWidth={220}>
          <Metric
            label="Customers"
            value={String(list.data?.total ?? 0)}
            icon="users"
            tone="brand"
            loading={list.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Lifetime spend"
            value={formatMoneyCompact(totalSpend)}
            icon="dollar-sign"
            tone="success"
            loading={list.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Repeat rate"
            value={`${Math.round(repeatRate * 100)}%`}
            hint="more than one order"
            icon="repeat"
            tone="info"
            loading={list.isLoading}
          />
        </GridItem>
        <GridItem minWidth={220}>
          <Metric
            label="Avg lifetime value"
            value={formatMoney(items.length ? Math.round(totalSpend / items.length) : 0)}
            icon="award"
            tone="warning"
            loading={list.isLoading}
          />
        </GridItem>
      </Grid>

      <Card flush>
        <View style={{ padding: t.space[5], paddingBottom: t.space[4] }}>
          <Input
            placeholder="Search customers by name or email"
            iconLeft="search"
            size="sm"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(customer) => customer.id}
          loading={list.isLoading}
          error={list.error}
          onRetry={() => void list.refetch()}
          onRowPress={(customer) => setSelectedId(customer.id)}
          minWidth={860}
          empty={{
            icon: 'user-x',
            title: 'No customers found',
            description: 'Try a different name or email.',
          }}
        />
      </Card>

      <CustomerDrawer customerId={selectedId} onClose={() => setSelectedId(null)} />
    </Column>
  );
}

function CustomerDrawer({
  customerId,
  onClose,
}: {
  customerId: string | null;
  onClose: () => void;
}) {
  const t = useTheme();
  const detail = useGetCustomersId(customerId ?? '', { query: { enabled: Boolean(customerId) } });
  const customer = detail.data;

  return (
    <Dialog
      visible={Boolean(customerId)}
      onClose={onClose}
      presentation="drawer"
      title={customer?.name ?? 'Customer'}
      description={customer?.email}
      footer={<Button label="Close" variant="secondary" onPress={onClose} />}
    >
      {customer ? (
        <>
          <Row gap={4}>
            <Avatar name={customer.name} size="lg" />
            <Column gap={1} flex={1}>
              <Text variant="label">{pluralize(customer.orderCount, 'order')}</Text>
              <Text variant="caption" tone="muted">
                {customer.lastOrderAt
                  ? `Last order ${formatRelativeTime(customer.lastOrderAt)}`
                  : 'No orders yet'}
              </Text>
            </Column>
          </Row>

          <Surface variant="sunken" padding={4} radius="lg" bordered={false}>
            <Row justify="space-between">
              <Column gap={1}>
                <Text variant="caption" tone="muted">
                  Lifetime spend
                </Text>
                <Text variant="h3" tabular>
                  {formatMoney(customer.lifetimeSpendCents)}
                </Text>
              </Column>
              <Column gap={1}>
                <Text variant="caption" tone="muted">
                  Average order
                </Text>
                <Text variant="h3" tabular>
                  {formatMoney(
                    Math.round(customer.lifetimeSpendCents / Math.max(1, customer.orderCount)),
                  )}
                </Text>
              </Column>
            </Row>
          </Surface>

          <Column gap={3}>
            <Text variant="h4">Recent orders</Text>
            {customer.recentOrders.length === 0 ? (
              <Text variant="bodySm" tone="muted">
                No orders yet.
              </Text>
            ) : (
              customer.recentOrders.map((order, index) => (
                <View key={order.id} style={{ gap: t.space[3] }}>
                  {index > 0 ? <Divider /> : null}
                  <Row justify="space-between">
                    <Column gap={0.5}>
                      <Text variant="label">{order.reference}</Text>
                      <Text variant="caption" tone="muted">
                        {formatRelativeTime(order.createdAt)}
                      </Text>
                    </Column>
                    <Text variant="label" tabular>
                      {formatMoney(order.totalCents)}
                    </Text>
                  </Row>
                </View>
              ))
            )}
          </Column>
        </>
      ) : null}
    </Dialog>
  );
}

import {
  Button,
  Column,
  Dialog,
  IconButton,
  Input,
  Row,
  Select,
  Text,
  formatMoney,
  useToast,
} from '@ody/shared';
import type { CreateOrder, OrderChannel } from '@ody/api-client';
import { useGetCustomers, useGetMenu, usePostOrders } from '@ody/api-client';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { errorMessage } from '@/lib/errorMessage';
import { useInvalidateOps } from '@/lib/useInvalidateOps';

type Line = { menuItemId: string; quantity: string };

export function CreateOrderDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const customers = useGetCustomers();
  const menu = useGetMenu();
  const create = usePostOrders();

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [channel, setChannel] = useState<OrderChannel>('dine_in');
  const [lines, setLines] = useState<Line[]>([{ menuItemId: '', quantity: '1' }]);

  const items = useMemo(
    () => (menu.data ?? []).flatMap((category) => category.items.filter((item) => item.available)),
    [menu.data],
  );

  const submit = () => {
    const payload: CreateOrder = {
      customerId: customerId ?? undefined,
      channel,
      items: lines
        .filter((line) => line.menuItemId && Number(line.quantity) > 0)
        .map((line) => ({ menuItemId: line.menuItemId, quantity: Number(line.quantity) })),
    };

    create.mutate(
      { data: payload },
      {
        onSuccess: (order) => {
          toast.success(
            `${order.reference} created`,
            `Total ${formatMoney(order.totalCents)} (server-calculated)`,
          );
          invalidate();
          onClose();
        },
        onError: (error) => toast.error('Could not create order', errorMessage(error)),
      },
    );
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="New order"
      description="Totals are calculated by the API. Unavailable items are rejected."
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button label="Place order" loading={create.isPending} onPress={submit} />
        </>
      }
    >
      <Select
        label="Customer"
        required
        value={customerId}
        onChange={setCustomerId}
        options={(customers.data?.items ?? []).map((customer) => ({
          value: customer.id,
          label: customer.name,
          description: customer.email,
        }))}
      />
      <Select
        label="Channel"
        value={channel}
        onChange={setChannel}
        options={[
          { value: 'dine_in', label: 'Dine in' },
          { value: 'takeaway', label: 'Takeaway' },
          { value: 'delivery', label: 'Delivery' },
        ]}
      />
      <Column gap={3}>
        <Text variant="label">Items</Text>
        {lines.map((line, index) => (
          <Row key={index} gap={2} align="flex-start">
            <View style={{ flex: 2 }}>
              <Select
                value={line.menuItemId || null}
                onChange={(menuItemId) =>
                  setLines((current) =>
                    current.map((entry, i) => (i === index ? { ...entry, menuItemId } : entry)),
                  )
                }
                options={items.map((item) => ({
                  value: item.id,
                  label: item.name,
                  description: formatMoney(item.priceCents),
                }))}
                placeholder="Menu item"
              />
            </View>
            <View style={{ width: 88 }}>
              <Input
                value={line.quantity}
                onChangeText={(quantity) =>
                  setLines((current) =>
                    current.map((entry, i) => (i === index ? { ...entry, quantity } : entry)),
                  )
                }
                keyboardType="number-pad"
              />
            </View>
            <IconButton
              icon="trash-2"
              accessibilityLabel="Remove line"
              onPress={() => setLines((current) => current.filter((_, i) => i !== index))}
              disabled={lines.length === 1}
            />
          </Row>
        ))}
        <Button
          label="Add item"
          variant="ghost"
          iconLeft="plus"
          size="sm"
          onPress={() => setLines((current) => [...current, { menuItemId: '', quantity: '1' }])}
        />
      </Column>
    </Dialog>
  );
}

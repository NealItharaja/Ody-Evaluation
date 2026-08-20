import { useState } from 'react';
import { useGetOrders } from '@ody/api-client';

import {
  isDefaultOrderFilter,
  toOrdersQuery,
  type OrderChannelFilter,
  type OrderStatusFilter,
} from './filterOrders';

export type { OrderStatusFilter };

export function useOrderFilters() {
  const [status, setStatus] = useState<OrderStatusFilter>('open');
  const [channel, setChannel] = useState<OrderChannelFilter>('all');
  const [search, setSearch] = useState('');

  const filters = { status, channel, search };
  const query = useGetOrders(toOrdersQuery(filters));

  return {
    filters,
    setStatus,
    setChannel,
    setSearch,
    reset: () => {
      setStatus('open');
      setChannel('all');
      setSearch('');
    },
    isFiltered: !isDefaultOrderFilter(filters),
    orders: query.data?.items ?? [],
    counts: {
      all: query.data?.total ?? 0,
      open: query.data?.openCount ?? 0,
      completed: query.data?.completedCount ?? 0,
      cancelled: query.data?.cancelledCount ?? 0,
    },
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

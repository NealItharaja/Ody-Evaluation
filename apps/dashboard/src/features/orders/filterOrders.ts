import type { GetOrdersParams, GetOrdersStatus, OrderChannel } from '@ody/api-client';

export type OrderStatusFilter = GetOrdersStatus | 'all';
export type OrderChannelFilter = OrderChannel | 'all';

export type OrderFilters = {
  status: OrderStatusFilter;
  channel: OrderChannelFilter;
  search: string;
};

export function toOrdersQuery({ status, channel, search }: OrderFilters): GetOrdersParams {
  return {
    status: status === 'all' ? undefined : status,
    channel: channel === 'all' ? undefined : channel,
    search: search.trim() || undefined,
  };
}

export function isDefaultOrderFilter({ status, channel, search }: OrderFilters): boolean {
  return status === 'open' && channel === 'all' && search.trim().length === 0;
}

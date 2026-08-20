import type { IconName, SemanticTone } from '@ody/shared';
import type { OrderAction, OrderListItemChannel, OrderListItemStatus } from '@ody/api-client';

/**
 * Display mapping only. Legal transitions come from `allowedActions` on each
 * order — the backend state machine is not duplicated here.
 */
export const ORDER_STATUS_META: Record<
  OrderListItemStatus,
  { label: string; tone: SemanticTone; icon: IconName }
> = {
  pending: { label: 'Pending', tone: 'warning', icon: 'clock' },
  accepted: { label: 'Accepted', tone: 'info', icon: 'check' },
  preparing: { label: 'Preparing', tone: 'brand', icon: 'thermometer' },
  ready: { label: 'Ready', tone: 'success', icon: 'package' },
  completed: { label: 'Completed', tone: 'neutral', icon: 'check-circle' },
  cancelled: { label: 'Cancelled', tone: 'danger', icon: 'x-circle' },
};

export const ORDER_CHANNEL_LABELS: Record<OrderListItemChannel, string> = {
  dine_in: 'Dine in',
  takeaway: 'Takeaway',
  delivery: 'Delivery',
};

export const ORDER_ACTION_LABELS: Record<OrderAction, string> = {
  accept: 'Accept',
  start_preparing: 'Start preparing',
  mark_ready: 'Mark ready',
  complete: 'Complete',
  cancel: 'Cancel',
};

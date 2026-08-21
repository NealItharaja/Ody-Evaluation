import { ORDER_ACTIONS, type OrderAction, type OrderStatus } from '../db/schema';
import { conflict } from './errors';

const ACTION_RESULT: Record<OrderAction, OrderStatus> = {
  accept: 'accepted',
  start_preparing: 'preparing',
  mark_ready: 'ready',
  complete: 'completed',
  cancel: 'cancelled',
};

const ALLOWED_ACTIONS: Record<OrderStatus, readonly OrderAction[]> = {
  pending: ['accept', 'cancel'],
  accepted: ['start_preparing', 'cancel'],
  preparing: ['mark_ready', 'cancel'],
  ready: ['complete', 'cancel'],
  completed: [],
  cancelled: [],
};

export function allowedActions(status: OrderStatus): OrderAction[] {
  return [...ALLOWED_ACTIONS[status]];
}

/**
 * Status is never a free-form field. The only way to move an order is through
 * a named action that is legal for the current status.
 */
export function applyOrderAction(status: OrderStatus, action: OrderAction): OrderStatus {
  if (!ALLOWED_ACTIONS[status].includes(action)) {
    throw conflict('order.invalid_transition', `Cannot ${action} an order that is ${status}`);
  }
  return ACTION_RESULT[action];
}

export { ORDER_ACTIONS };

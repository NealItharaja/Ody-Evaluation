import type { OrderChannel } from '../db/schema';
import { unprocessable } from './errors';

export type ChannelFlags = {
  serviceOpen: boolean;
  acceptDineIn: boolean;
  acceptTakeaway: boolean;
  acceptDelivery: boolean;
};

export function assertChannelAllowed(channel: OrderChannel, flags: ChannelFlags): void {
  if (!flags.serviceOpen) {
    throw unprocessable('ordering.service_closed', 'This location is not accepting orders');
  }

  const enabled =
    channel === 'dine_in'
      ? flags.acceptDineIn
      : channel === 'takeaway'
        ? flags.acceptTakeaway
        : flags.acceptDelivery;

  if (!enabled) {
    throw unprocessable('ordering.channel_disabled', `${channel} orders are not enabled`);
  }
}

export function assertAtLeastOneChannel(flags: ChannelFlags): void {
  if (!flags.acceptDineIn && !flags.acceptTakeaway && !flags.acceptDelivery) {
    throw unprocessable('settings.no_channels', 'At least one ordering channel must stay enabled');
  }
}

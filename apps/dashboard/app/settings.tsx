import {
  Button,
  Callout,
  Card,
  Checkbox,
  Column,
  Divider,
  Grid,
  GridItem,
  Input,
  PageHeader,
  Row,
  Select,
  Switch,
  Text,
  useToast,
} from '@ody/shared';
import { useGetSettings, usePutSettings } from '@ody/api-client';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { errorMessage } from '@/lib/errorMessage';
import { useInvalidateOps } from '@/lib/useInvalidateOps';

type Draft = {
  prepTimeMinutes: string;
  autoAccept: boolean;
  acceptDineIn: boolean;
  acceptTakeaway: boolean;
  acceptDelivery: boolean;
  serviceOpen: boolean;
  opensAt: string;
  closesAt: string;
  timezone: string;
  taxRatePercent: string;
};

function toDraft(settings: {
  prepTimeMinutes: number;
  autoAccept: boolean;
  acceptDineIn: boolean;
  acceptTakeaway: boolean;
  acceptDelivery: boolean;
  serviceOpen: boolean;
  opensAt: string;
  closesAt: string;
  timezone: string;
  taxRateBps: number;
}): Draft {
  return {
    prepTimeMinutes: String(settings.prepTimeMinutes),
    autoAccept: settings.autoAccept,
    acceptDineIn: settings.acceptDineIn,
    acceptTakeaway: settings.acceptTakeaway,
    acceptDelivery: settings.acceptDelivery,
    serviceOpen: settings.serviceOpen,
    opensAt: settings.opensAt,
    closesAt: settings.closesAt,
    timezone: settings.timezone,
    taxRatePercent: (settings.taxRateBps / 100).toFixed(2),
  };
}

export default function SettingsScreen() {
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const query = useGetSettings();
  const saveMutation = usePutSettings();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    if (query.data && !draft) setDraft(toDraft(query.data));
  }, [query.data, draft]);

  const saved = query.data ? toDraft(query.data) : null;
  const dirty = Boolean(draft && saved && JSON.stringify(draft) !== JSON.stringify(saved));
  const prepTimeError =
    draft && (draft.prepTimeMinutes.trim() === '' || Number(draft.prepTimeMinutes) <= 0)
      ? 'Prep time must be at least 1 minute'
      : undefined;
  const noChannels = Boolean(
    draft && !draft.acceptDineIn && !draft.acceptTakeaway && !draft.acceptDelivery,
  );

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const save = () => {
    if (!draft || prepTimeError || noChannels) {
      toast.error('Settings not saved', 'Fix the highlighted fields first.');
      return;
    }
    saveMutation.mutate(
      {
        data: {
          prepTimeMinutes: Number(draft.prepTimeMinutes),
          autoAccept: draft.autoAccept,
          serviceOpen: draft.serviceOpen,
          acceptDineIn: draft.acceptDineIn,
          acceptTakeaway: draft.acceptTakeaway,
          acceptDelivery: draft.acceptDelivery,
          opensAt: draft.opensAt,
          closesAt: draft.closesAt,
          timezone: draft.timezone,
          taxRateBps: Math.round(Number(draft.taxRatePercent) * 100),
        },
      },
      {
        onSuccess: (updated) => {
          setDraft(toDraft(updated));
          invalidate();
          toast.success('Settings saved', 'Ordering rules updated for this location.');
        },
        onError: (error) => toast.error('Could not save settings', errorMessage(error)),
      },
    );
  };

  if (!draft) {
    return (
      <Column gap={6}>
        <PageHeader title="Settings" description="Ordering rules for Rosemary & Vine." />
      </Column>
    );
  }

  return (
    <Column gap={6}>
      <PageHeader
        title="Settings"
        description="Ordering rules for Rosemary & Vine."
        actions={
          <>
            <Button
              label="Discard"
              variant="secondary"
              disabled={!dirty}
              onPress={() => saved && setDraft(saved)}
            />
            <Button
              label="Save changes"
              iconLeft="check"
              disabled={!dirty}
              loading={saveMutation.isPending}
              onPress={save}
            />
          </>
        }
      />

      {noChannels ? (
        <Callout
          tone="danger"
          title="No ordering channels enabled"
          description="Guests cannot place orders until at least one channel is turned on."
        />
      ) : dirty ? (
        <Callout
          tone="warning"
          title="Unsaved changes"
          description="Save to apply these rules to new orders."
        />
      ) : null}

      <Grid gap={5}>
        <GridItem minWidth={380} grow={2}>
          <Column gap={5}>
            <Card
              title="Service"
              description="Control whether the kitchen is accepting orders right now."
            >
              <Column gap={5}>
                <Switch
                  value={draft.serviceOpen}
                  onValueChange={(value) => update('serviceOpen', value)}
                  label="Accepting orders"
                  description="Turning this off immediately stops new orders across all channels."
                />
                <Divider />
                <Switch
                  value={draft.autoAccept}
                  onValueChange={(value) => update('autoAccept', value)}
                  label="Auto-accept incoming orders"
                  description="Skip manual confirmation and send tickets straight to the kitchen."
                />
              </Column>
            </Card>

            <Card title="Ordering channels" description="Where guests are allowed to order from.">
              <Column gap={4}>
                <Checkbox
                  checked={draft.acceptDineIn}
                  onCheckedChange={(value) => update('acceptDineIn', value)}
                  label="Dine in"
                  description="QR ordering at the table."
                />
                <Checkbox
                  checked={draft.acceptTakeaway}
                  onCheckedChange={(value) => update('acceptTakeaway', value)}
                  label="Takeaway"
                  description="Collection at the counter."
                />
                <Checkbox
                  checked={draft.acceptDelivery}
                  onCheckedChange={(value) => update('acceptDelivery', value)}
                  label="Delivery"
                  description="Dispatched through partner couriers."
                />
              </Column>
            </Card>
          </Column>
        </GridItem>

        <GridItem minWidth={320}>
          <Column gap={5}>
            <Card title="Kitchen timing" description="Drives the quoted wait time shown to guests.">
              <Column gap={5}>
                <Input
                  label="Default prep time"
                  required
                  value={draft.prepTimeMinutes}
                  onChangeText={(value) => update('prepTimeMinutes', value)}
                  keyboardType="number-pad"
                  suffix="min"
                  error={prepTimeError}
                />
                <Row gap={3} align="flex-start">
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Opens at"
                      value={draft.opensAt}
                      onChangeText={(value) => update('opensAt', value)}
                      iconLeft="sunrise"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Input
                      label="Closes at"
                      value={draft.closesAt}
                      onChangeText={(value) => update('closesAt', value)}
                      iconLeft="sunset"
                    />
                  </View>
                </Row>
              </Column>
            </Card>

            <Card title="Locale & tax" description="Applied to server-calculated order totals.">
              <Column gap={5}>
                <Select
                  label="Timezone"
                  value={draft.timezone}
                  onChange={(value) => update('timezone', value)}
                  options={[
                    { value: 'America/Los_Angeles', label: 'Los Angeles', description: 'GMT-7' },
                    { value: 'America/New_York', label: 'New York', description: 'GMT-4' },
                    { value: 'Europe/London', label: 'London', description: 'GMT+1' },
                  ]}
                />
                <Input
                  label="Tax rate"
                  value={draft.taxRatePercent}
                  onChangeText={(value) => update('taxRatePercent', value)}
                  keyboardType="decimal-pad"
                  suffix="%"
                  hint="Totals are always recalculated server-side."
                />
              </Column>
            </Card>
          </Column>
        </GridItem>
      </Grid>
    </Column>
  );
}

import {
  Badge,
  Button,
  Card,
  Column,
  Dialog,
  Grid,
  GridItem,
  IconButton,
  Input,
  PageHeader,
  Row,
  Select,
  Switch,
  Text,
  Textarea,
  formatMoney,
  useTheme,
  useToast,
} from '@ody/shared';
import type { MenuCategoryWithItems, MenuItem } from '@ody/api-client';
import {
  useGetMenu,
  usePatchMenuItemsId,
  usePostMenuCategories,
  usePostMenuItems,
} from '@ody/api-client';
import { useState } from 'react';
import { View } from 'react-native';

import { errorMessage } from '@/lib/errorMessage';
import { useInvalidateOps } from '@/lib/useInvalidateOps';

export default function MenuScreen() {
  const t = useTheme();
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const menu = useGetMenu();
  const patchItem = usePatchMenuItemsId();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);

  const categories = menu.data ?? [];

  const toggleAvailability = (item: MenuItem) => {
    patchItem.mutate(
      { id: item.id, data: { available: !item.available } },
      {
        onSuccess: (updated) => {
          toast.success(
            updated.available
              ? `${updated.name} is back on the menu`
              : `${updated.name} marked unavailable`,
          );
          invalidate();
        },
        onError: (error) => toast.error('Could not update item', errorMessage(error)),
      },
    );
  };

  return (
    <Column gap={6}>
      <PageHeader
        title="Menu"
        description="Categories, pricing and live availability."
        actions={
          <>
            <Button
              label="New category"
              variant="secondary"
              iconLeft="folder-plus"
              onPress={() => setCreatingCategory(true)}
            />
            <Button label="New item" iconLeft="plus" onPress={() => setCreating(true)} />
          </>
        }
      />

      {categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          onEdit={setEditing}
          onToggle={toggleAvailability}
        />
      ))}

      <MenuItemDialog
        key={editing?.id ?? (creating ? 'new' : 'closed')}
        item={editing}
        categories={categories}
        visible={editing !== null || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
      />
      <CategoryDialog visible={creatingCategory} onClose={() => setCreatingCategory(false)} />
    </Column>
  );
}

function CategorySection({
  category,
  onEdit,
  onToggle,
}: {
  category: MenuCategoryWithItems;
  onEdit: (item: MenuItem) => void;
  onToggle: (item: MenuItem) => void;
}) {
  const t = useTheme();
  return (
    <Column gap={3}>
      <Row gap={3}>
        <Text variant="h3">{category.name}</Text>
        <Badge label={`${category.items.length} items`} tone="neutral" size="sm" />
      </Row>
      <Grid gap={5}>
        {category.items.map((item) => (
          <GridItem key={item.id} minWidth={300}>
            <Card>
              <Column gap={4}>
                <Row align="flex-start" justify="space-between" gap={3}>
                  <View style={{ flex: 1, gap: t.space[1] }}>
                    <Text variant="h4">{item.name}</Text>
                    <Text variant="bodySm" tone="muted">
                      {item.description}
                    </Text>
                  </View>
                  <IconButton
                    icon="edit-2"
                    size="sm"
                    accessibilityLabel={`Edit ${item.name}`}
                    onPress={() => onEdit(item)}
                  />
                </Row>
                <Row justify="space-between">
                  <Text variant="h3" tabular>
                    {formatMoney(item.priceCents)}
                  </Text>
                  <Badge
                    label={item.available ? 'Available' : 'Sold out'}
                    tone={item.available ? 'success' : 'danger'}
                    dot
                  />
                </Row>
                <Switch
                  value={item.available}
                  onValueChange={() => onToggle(item)}
                  label="Available to order"
                />
              </Column>
            </Card>
          </GridItem>
        ))}
      </Grid>
    </Column>
  );
}

function MenuItemDialog({
  item,
  categories,
  visible,
  onClose,
}: {
  item: MenuItem | null;
  categories: MenuCategoryWithItems[];
  visible: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const create = usePostMenuItems();
  const patch = usePatchMenuItemsId();
  const [name, setName] = useState(item?.name ?? '');
  const [price, setPrice] = useState(item ? (item.priceCents / 100).toFixed(2) : '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const [submitted, setSubmitted] = useState(false);

  const nameError = submitted && name.trim().length === 0 ? 'Name is required' : undefined;
  const priceCents = Math.round(Number(price) * 100);
  const priceError =
    submitted && (!Number.isFinite(priceCents) || priceCents <= 0)
      ? 'Enter a price greater than zero'
      : undefined;

  const submit = () => {
    setSubmitted(true);
    if (name.trim().length === 0 || !Number.isFinite(priceCents) || priceCents <= 0) return;
    const payload = {
      name: name.trim(),
      description: description.trim(),
      priceCents,
      categoryId,
      available,
    };
    if (item) {
      patch.mutate(
        { id: item.id, data: payload },
        {
          onSuccess: () => {
            toast.success(`${name} updated`);
            invalidate();
            onClose();
          },
          onError: (error) => toast.error('Could not save item', errorMessage(error)),
        },
      );
    } else {
      create.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast.success(`${name} added to the menu`);
            invalidate();
            onClose();
          },
          onError: (error) => toast.error('Could not create item', errorMessage(error)),
        },
      );
    }
  };

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={item ? 'Edit menu item' : 'New menu item'}
      description={
        item ? 'Changes apply to the live menu immediately.' : 'Add a dish to the current menu.'
      }
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button
            label={item ? 'Save changes' : 'Create item'}
            loading={create.isPending || patch.isPending}
            onPress={submit}
          />
        </>
      }
    >
      <Input
        label="Name"
        required
        value={name}
        onChangeText={setName}
        error={nameError}
        placeholder="Dish name"
      />
      <Row gap={4} align="flex-start">
        <View style={{ flex: 1 }}>
          <Input
            label="Price"
            required
            value={price}
            onChangeText={setPrice}
            error={priceError}
            placeholder="0.00"
            keyboardType="decimal-pad"
            suffix="USD"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            label="Category"
            value={categoryId || null}
            onChange={setCategoryId}
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
        </View>
      </Row>
      <Textarea
        label="Description"
        value={description}
        onChangeText={setDescription}
        hint="Shown to guests on the ordering menu."
        placeholder="Short, appetising description"
      />
      <Switch
        value={available}
        onValueChange={setAvailable}
        label="Available to order"
        description="Unavailable items are rejected by the ordering API."
      />
    </Dialog>
  );
}

function CategoryDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const toast = useToast();
  const invalidate = useInvalidateOps();
  const create = usePostMenuCategories();
  const [name, setName] = useState('');

  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title="New category"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onPress={onClose} />
          <Button
            label="Create"
            loading={create.isPending}
            onPress={() => {
              if (!name.trim()) return;
              create.mutate(
                { data: { name: name.trim() } },
                {
                  onSuccess: () => {
                    toast.success(`${name} added`);
                    invalidate();
                    onClose();
                  },
                  onError: (error) => toast.error('Could not create category', errorMessage(error)),
                },
              );
            }}
          />
        </>
      }
    >
      <Input
        label="Name"
        required
        value={name}
        onChangeText={setName}
        placeholder="e.g. Small plates"
      />
    </Dialog>
  );
}

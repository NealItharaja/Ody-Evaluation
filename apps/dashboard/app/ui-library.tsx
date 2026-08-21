import {
  Avatar,
  Badge,
  Button,
  Callout,
  Card,
  Checkbox,
  Column,
  DataTable,
  Dialog,
  Divider,
  EmptyState,
  ErrorState,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Input,
  Metric,
  PageHeader,
  Row,
  Select,
  Skeleton,
  Surface,
  Switch,
  Tabs,
  Text,
  Textarea,
  elevation,
  palette,
  radius,
  space,
  theme,
  typography,
  useTheme,
  useToast,
  type SemanticTone,
  type TextVariant,
} from '@ody/shared';
import { useState } from 'react';
import { View, type ViewStyle } from 'react-native';

type SectionId = 'tokens' | 'typography' | 'surfaces' | 'components' | 'states';

/**
 * Living documentation for the design system. Everything on this page is the
 * real component — there are no screenshots or copies to drift out of date.
 */
export default function UiLibraryScreen() {
  const [section, setSection] = useState<SectionId>('tokens');

  return (
    <Column gap={6}>
      <PageHeader
        title="UI Library"
        description="Tokens, primitives and states that every screen is built from."
        actions={<Badge label="v0.1" tone="brand" />}
      >
        <Tabs<SectionId>
          value={section}
          onChange={setSection}
          items={[
            { value: 'tokens', label: 'Tokens', icon: 'droplet' },
            { value: 'typography', label: 'Typography', icon: 'type' },
            { value: 'surfaces', label: 'Surfaces', icon: 'layers' },
            { value: 'components', label: 'Components', icon: 'grid' },
            { value: 'states', label: 'States', icon: 'activity' },
          ]}
        />
      </PageHeader>

      {section === 'tokens' ? <TokensSection /> : null}
      {section === 'typography' ? <TypographySection /> : null}
      {section === 'surfaces' ? <SurfacesSection /> : null}
      {section === 'components' ? <ComponentsSection /> : null}
      {section === 'states' ? <StatesSection /> : null}
    </Column>
  );
}

/* ------------------------------------------------------------------ tokens */

function TokensSection() {
  const t = useTheme();

  const ramps = [
    ['neutral', palette.neutral],
    ['brand', palette.brand],
    ['accent', palette.accent],
    ['green', palette.green],
    ['amber', palette.amber],
    ['red', palette.red],
    ['blue', palette.blue],
    ['purple', palette.purple],
  ] as const;

  const tones = Object.keys(t.tone) as SemanticTone[];

  return (
    <Column gap={5}>
      <Card
        title="Color ramps"
        description="Primitive palette. Components never reference these directly."
      >
        <Column gap={5}>
          {ramps.map(([name, ramp]) => (
            <Column key={name} gap={2}>
              <Text variant="overline" tone="muted">
                {name.toUpperCase()}
              </Text>
              <Row gap={2} wrap>
                {Object.entries(ramp).map(([step, value]) => (
                  <Column key={step} gap={1} style={{ width: 66 }}>
                    <View
                      style={{
                        height: 40,
                        borderRadius: t.radius.md,
                        backgroundColor: value as string,
                        borderWidth: t.borderWidth.thin,
                        borderColor: t.color.border,
                      }}
                    />
                    <Text variant="caption" tone="muted">
                      {step}
                    </Text>
                  </Column>
                ))}
              </Row>
            </Column>
          ))}
        </Column>
      </Card>

      <Card title="Semantic tones" description="The mapping components actually consume.">
        <Grid gap={4}>
          {tones.map((tone) => {
            const ramp = t.tone[tone];
            return (
              <GridItem key={tone} minWidth={240}>
                <Surface variant="sunken" padding={4} radius="lg" bordered={false}>
                  <Column gap={3}>
                    <Row justify="space-between">
                      <Text variant="label">{tone}</Text>
                      <Badge label="badge" tone={tone} dot />
                    </Row>
                    <Row gap={2}>
                      {(['surface', 'border', 'solid', 'onSurface'] as const).map((key) => (
                        <Column key={key} gap={1} flex={1}>
                          <View
                            style={{
                              height: 28,
                              borderRadius: t.radius.sm,
                              backgroundColor: ramp[key],
                              borderWidth: t.borderWidth.thin,
                              borderColor: t.color.border,
                            }}
                          />
                          <Text variant="caption" tone="muted">
                            {key}
                          </Text>
                        </Column>
                      ))}
                    </Row>
                  </Column>
                </Surface>
              </GridItem>
            );
          })}
        </Grid>
      </Card>

      <Grid gap={5}>
        <GridItem minWidth={340}>
          <Card
            title="Spacing scale"
            description="4px base. Keys are multipliers of the base unit."
          >
            <Column gap={3}>
              {Object.entries(space)
                .filter(([, value]) => value > 0)
                .map(([key, value]) => (
                  <Row key={key} gap={3}>
                    <Text variant="mono" tone="muted" style={{ width: 44 }}>
                      {key}
                    </Text>
                    <View
                      style={{
                        height: 10,
                        width: value,
                        borderRadius: t.radius.sm,
                        backgroundColor: t.tone.brand.border,
                      }}
                    />
                    <Text variant="caption" tone="muted">
                      {value}px
                    </Text>
                  </Row>
                ))}
            </Column>
          </Card>
        </GridItem>

        <GridItem minWidth={340}>
          <Column gap={5}>
            <Card title="Radius" description="Corner rounding tokens.">
              <Row gap={4} wrap>
                {Object.entries(radius).map(([key, value]) => (
                  <Column key={key} gap={2} align="center">
                    <View
                      style={{
                        width: 60,
                        height: 44,
                        borderRadius: value,
                        backgroundColor: t.color.surfaceSunken,
                        borderWidth: t.borderWidth.thin,
                        borderColor: t.color.borderStrong,
                      }}
                    />
                    <Text variant="caption" tone="muted">
                      {key}
                    </Text>
                  </Column>
                ))}
              </Row>
            </Card>

            <Card title="Elevation" description="Shadow ramp, mapped per platform.">
              <Row gap={4} wrap>
                {Object.keys(elevation).map((key) => (
                  <Column key={key} gap={2} align="center">
                    <View
                      style={[
                        {
                          width: 60,
                          height: 44,
                          borderRadius: t.radius.md,
                          backgroundColor: t.color.surface,
                          borderWidth: t.borderWidth.thin,
                          borderColor: t.color.border,
                        },
                        elevation[Number(key) as keyof typeof elevation] as ViewStyle,
                      ]}
                    />
                    <Text variant="caption" tone="muted">
                      {key}
                    </Text>
                  </Column>
                ))}
              </Row>
            </Card>
          </Column>
        </GridItem>
      </Grid>

      <Card title="Layout rules" description="Shared page geometry and the 12-column grid.">
        <Row gap={6} wrap>
          {[
            ['Sidebar', `${theme.layout.sidebarWidth}px`],
            ['Top bar', `${theme.layout.topBarHeight}px`],
            ['Content max', `${theme.layout.contentMaxWidth}px`],
            ['Page gutter', `${theme.layout.pageGutter}px`],
            ['Grid', `${theme.layout.grid.columns} cols / ${theme.layout.grid.gap}px gap`],
          ].map(([label, value]) => (
            <Column key={label} gap={1}>
              <Text variant="caption" tone="muted">
                {label}
              </Text>
              <Text variant="label" tabular>
                {value}
              </Text>
            </Column>
          ))}
        </Row>
      </Card>
    </Column>
  );
}

/* -------------------------------------------------------------- typography */

function TypographySection() {
  const variants = Object.keys(typography.variants) as TextVariant[];

  return (
    <Card
      title="Type scale"
      description="Each variant is a complete recipe: size, line height, weight, tracking."
    >
      <Column gap={5}>
        {variants.map((variant) => {
          const recipe = typography.variants[variant];
          return (
            <Column key={variant} gap={1}>
              <Row gap={3} justify="space-between" wrap>
                <Text variant="overline" tone="muted">
                  {variant.toUpperCase()}
                </Text>
                <Text variant="mono" tone="muted">
                  {recipe.fontSize}/{recipe.lineHeight} · {recipe.fontWeight}
                </Text>
              </Row>
              <Text variant={variant}>The quick brown fox jumps over the lazy dog</Text>
              <Divider />
            </Column>
          );
        })}
      </Column>
    </Card>
  );
}

/* ---------------------------------------------------------------- surfaces */

function SurfacesSection() {
  return (
    <Grid gap={5}>
      <GridItem minWidth={280}>
        <Surface padding={5} radius="lg" elevation={1}>
          <Column gap={2}>
            <Text variant="h4">Raised surface</Text>
            <Text variant="bodySm" tone="muted">
              Default panel. White background, hairline border, elevation 1.
            </Text>
          </Column>
        </Surface>
      </GridItem>
      <GridItem minWidth={280}>
        <Surface padding={5} radius="lg" variant="sunken" bordered={false}>
          <Column gap={2}>
            <Text variant="h4">Sunken surface</Text>
            <Text variant="bodySm" tone="muted">
              For inset areas: table headers, summaries, footers.
            </Text>
          </Column>
        </Surface>
      </GridItem>
      <GridItem minWidth={280}>
        <Card
          title="Card with header"
          description="Title, description and an action slot."
          action={<IconButton icon="more-horizontal" accessibilityLabel="More" size="sm" />}
        >
          <Text variant="bodySm" tone="muted">
            Body content sits under the header with consistent padding.
          </Text>
        </Card>
      </GridItem>
      <GridItem minWidth={280}>
        <Metric
          label="Metric surface"
          value="$12.4k"
          delta={{ value: '+6.1%', direction: 'up' }}
          hint="vs last week"
          icon="dollar-sign"
        />
      </GridItem>
    </Grid>
  );
}

/* -------------------------------------------------------------- components */

function ComponentsSection() {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [selectValue, setSelectValue] = useState<string | null>('pasta');
  const [text, setText] = useState('');

  const rows = [
    { id: '1', name: 'Cacio e Pepe', category: 'Pasta', price: '$24.00', status: 'Available' },
    {
      id: '2',
      name: 'Short Rib Pappardelle',
      category: 'Pasta',
      price: '$32.00',
      status: 'Sold out',
    },
  ];

  return (
    <Column gap={5}>
      <Card title="Buttons" description="Variants, sizes and every interaction state.">
        <Column gap={5}>
          <Row gap={3} wrap>
            <Button label="Primary" />
            <Button label="Secondary" variant="secondary" />
            <Button label="Soft" variant="soft" />
            <Button label="Ghost" variant="ghost" />
            <Button label="Danger" variant="danger" />
          </Row>
          <Divider />
          <Row gap={3} wrap align="center">
            <Button label="Small" size="sm" />
            <Button label="Medium" size="md" />
            <Button label="Large" size="lg" />
          </Row>
          <Divider />
          <Row gap={3} wrap>
            <Button label="With icon" iconLeft="plus" />
            <Button label="Trailing" variant="secondary" iconRight="arrow-right" />
            <Button label="Loading" loading />
            <Button label="Disabled" disabled />
            <IconButton icon="edit-2" accessibilityLabel="Edit" variant="secondary" />
            <IconButton icon="trash-2" accessibilityLabel="Delete" variant="ghost" />
          </Row>
        </Column>
      </Card>

      <Grid gap={5}>
        <GridItem minWidth={360}>
          <Card
            title="Form controls"
            description="Inputs, selects and toggles with validation states."
          >
            <Column gap={5}>
              <Input label="Default" placeholder="Dish name" value={text} onChangeText={setText} />
              <Input
                label="With hint"
                placeholder="0.00"
                suffix="USD"
                hint="Stored as integer cents."
              />
              <Input label="Invalid" value="-4.00" error="Price must be greater than zero" />
              <Input label="Disabled" value="Locked value" disabled />
              <Select
                label="Select"
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: 'small', label: 'Small plates', description: '6 items' },
                  { value: 'pasta', label: 'Pasta', description: '4 items' },
                  { value: 'dessert', label: 'Dessert', description: '3 items' },
                  { value: 'archived', label: 'Archived', disabled: true },
                ]}
              />
              <Textarea label="Textarea" placeholder="Short description" />
              <Divider />
              <Switch
                value={switchOn}
                onValueChange={setSwitchOn}
                label="Auto-accept orders"
                description="Send tickets straight to the kitchen."
              />
              <Checkbox checked={checked} onCheckedChange={setChecked} label="Accept delivery" />
              <Switch
                value={false}
                onValueChange={() => undefined}
                label="Disabled toggle"
                disabled
              />
            </Column>
          </Card>
        </GridItem>

        <GridItem minWidth={360}>
          <Column gap={5}>
            <Card title="Badges" description="Status indicators across all tones.">
              <Column gap={4}>
                <Row gap={2} wrap>
                  {(
                    ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as SemanticTone[]
                  ).map((tone) => (
                    <Badge key={tone} label={tone} tone={tone} dot />
                  ))}
                </Row>
                <Row gap={2} wrap>
                  {(
                    ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as SemanticTone[]
                  ).map((tone) => (
                    <Badge key={tone} label={tone} tone={tone} variant="solid" />
                  ))}
                </Row>
                <Row gap={2} wrap>
                  {(
                    ['neutral', 'brand', 'success', 'warning', 'danger', 'info'] as SemanticTone[]
                  ).map((tone) => (
                    <Badge key={tone} label={tone} tone={tone} variant="outline" size="sm" />
                  ))}
                </Row>
              </Column>
            </Card>

            <Card title="Avatars & icons">
              <Column gap={4}>
                <Row gap={3}>
                  <Avatar name="Amara Whitfield" size="sm" />
                  <Avatar name="Diego Salcedo" />
                  <Avatar name="Priya Raghavan" size="lg" />
                </Row>
                <Row gap={4} wrap>
                  {(['home', 'clipboard', 'book-open', 'users', 'settings', 'bell'] as const).map(
                    (name) => (
                      <Icon key={name} name={name} size="lg" />
                    ),
                  )}
                </Row>
              </Column>
            </Card>

            <Card title="Overlays & feedback">
              <Row gap={3} wrap>
                <Button
                  label="Open dialog"
                  variant="secondary"
                  iconLeft="maximize-2"
                  onPress={() => setDialogOpen(true)}
                />
                <Button
                  label="Success toast"
                  variant="soft"
                  onPress={() => toast.success('Menu item saved', 'Cacio e Pepe is live.')}
                />
                <Button
                  label="Error toast"
                  variant="secondary"
                  onPress={() => toast.error('Could not save', 'The API rejected this payload.')}
                />
              </Row>
            </Card>
          </Column>
        </GridItem>
      </Grid>

      <Card title="Table" description="Owns its own header, hover and row-press affordances." flush>
        <DataTable
          minWidth={520}
          keyExtractor={(row) => row.id}
          data={rows}
          onRowPress={() => toast.show({ title: 'Row pressed' })}
          columns={[
            {
              id: 'name',
              header: 'Item',
              flex: 1.4,
              render: (row) => <Text variant="label">{row.name}</Text>,
            },
            {
              id: 'category',
              header: 'Category',
              flex: 1,
              render: (row) => (
                <Text variant="body" tone="secondary">
                  {row.category}
                </Text>
              ),
            },
            {
              id: 'price',
              header: 'Price',
              width: 100,
              render: (row) => (
                <Text variant="label" tabular>
                  {row.price}
                </Text>
              ),
            },
            {
              id: 'status',
              header: 'Status',
              width: 130,
              render: (row) => (
                <Badge
                  label={row.status}
                  tone={row.status === 'Available' ? 'success' : 'danger'}
                  dot
                />
              ),
            },
          ]}
        />
      </Card>

      <Dialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Dialog primitive"
        description="Centered on wide screens, a drawer on compact ones."
        footer={
          <>
            <Button label="Cancel" variant="secondary" onPress={() => setDialogOpen(false)} />
            <Button label="Confirm" onPress={() => setDialogOpen(false)} />
          </>
        }
      >
        <Input label="Name" placeholder="Enter a value" />
        <Callout
          tone="info"
          title="One dialog, every flow"
          description="Create and edit flows share this primitive."
        />
      </Dialog>
    </Column>
  );
}

/* ------------------------------------------------------------------ states */

function StatesSection() {
  return (
    <Column gap={5}>
      <Grid gap={5}>
        <GridItem minWidth={320}>
          <Card title="Empty" flush>
            <EmptyState
              icon="coffee"
              title="No open orders"
              description="Every ticket is cleared. New orders appear here instantly."
              action={<Button label="Create order" iconLeft="plus" size="sm" />}
            />
          </Card>
        </GridItem>
        <GridItem minWidth={320}>
          <Card title="Error" flush>
            <ErrorState onRetry={() => undefined} />
          </Card>
        </GridItem>
      </Grid>

      <Card title="Loading" description="Skeletons mirror the shape of the content they replace.">
        <Grid gap={5}>
          <GridItem minWidth={220}>
            <Metric label="Loading metric" value="" loading />
          </GridItem>
          <GridItem minWidth={220}>
            <Column gap={3}>
              <Skeleton width="60%" height={12} />
              <Skeleton height={12} />
              <Skeleton width="80%" height={12} />
              <Skeleton height={44} radius="md" />
            </Column>
          </GridItem>
        </Grid>
      </Card>

      <Card title="Table loading" flush>
        <DataTable
          loading
          minWidth={520}
          data={[]}
          keyExtractor={() => ''}
          columns={[
            { id: 'a', header: 'Item', flex: 1, render: () => null },
            { id: 'b', header: 'Category', flex: 1, render: () => null },
            { id: 'c', header: 'Price', width: 100, render: () => null },
            { id: 'd', header: 'Status', width: 120, render: () => null },
          ]}
        />
      </Card>

      <Card title="Inline feedback" description="Callouts for form-level and page-level messaging.">
        <Column gap={4}>
          <Callout
            tone="success"
            title="Order accepted"
            description="Ticket sent to the kitchen."
          />
          <Callout
            tone="warning"
            title="Unsaved changes"
            description="Save to apply these rules to new orders."
          />
          <Callout
            tone="danger"
            title="Order rejected"
            description="Braised Short Rib Pappardelle is unavailable."
          />
          <Callout
            tone="info"
            title="Totals are server-calculated"
            description="The client never decides the price."
          />
        </Column>
      </Card>
    </Column>
  );
}

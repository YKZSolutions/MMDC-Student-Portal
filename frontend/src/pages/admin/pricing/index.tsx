import GroupedIncludedFeesForm from '@/features/pricing/components/grouped-included-fees'
import {
  pricingFormSchema,
  type PricingFormInput,
  type PricingFormOutput,
} from '@/features/pricing/pricing-form.schema'
import {
  pricingGroupFormSchema,
  type PricingGroupFormInput,
  type PricingGroupFormOutput,
} from '@/features/pricing/pricing-group-form.schema'
import { useQuickAction } from '@/hooks/use-quick-action'
import { useQuickForm } from '@/hooks/use-quick-form'
import type { PricingType } from '@/integrations/api/client'
import {
  pricingControllerCreateMutation,
  pricingControllerFindAllOptions,
  pricingControllerFindAllQueryKey,
  pricingControllerFindOneOptions,
  pricingControllerRemoveMutation,
  pricingControllerUpdateMutation,
  pricingGroupControllerCreateMutation,
  pricingGroupControllerFindAllOptions,
  pricingGroupControllerFindAllQueryKey,
  pricingGroupControllerFindOneOptions,
  pricingGroupControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  Paper,
  rem,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import Decimal from 'decimal.js'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense } from 'react'
import z from 'zod'

const route = getRouteApi('/(protected)/pricing/')

export default function PricingPage() {
  return (
    <Container size={'md'} w={'100%'} p="md">
      <Stack gap="lg">
        <Group align="flex-start">
          <Box>
            <Title order={2}>Pricing</Title>
            <Text c="dimmed" size="sm">
              Manage and configure fee templates for student billing. Enable,
              disable, or edit templates as needed.
            </Text>
          </Box>
        </Group>
        <Tabs
          defaultValue={'grouped'}
          radius="md"
          color="teal"
          keepMounted={false}
          variant="outline"
        >
          <Tabs.List mb={'lg'}>
            <Tabs.Tab value="grouped">Grouped Fees</Tabs.Tab>
            <Tabs.Tab value="individual">Individual Fees</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="grouped">
            <Suspense fallback={'Loading'}>
              <GroupedFeesTab />
            </Suspense>
          </Tabs.Panel>
          <Tabs.Panel value="individual">
            <Suspense fallback={'Loading'}>
              <IndividualFeesTab />
            </Suspense>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

function GroupedFeesTab() {
  return (
    <Stack>
      <Group justify="end" wrap="wrap" gap={'xs'}>
        <TextInput
          placeholder="Search grouped fee"
          radius={'md'}
          leftSection={<IconSearch size={18} stroke={1} />}
          w={rem(250)}
        />
        <GroupedFeeFormDrawer />
      </Group>
      <GroupedFeesList />
    </Stack>
  )
}

function GroupedFeesList() {
  const navigate = route.useNavigate()

  const handleOpenDrawer = (id: string) => {
    navigate({
      search: {
        updateGroup: id,
      },
    })
  }

  const { data } = useSuspenseQuery(pricingGroupControllerFindAllOptions())

  const { pricingGroups, meta } = data

  const { remove } = useQuickAction({
    name: 'pricing',
    removeMutationOptions: pricingControllerRemoveMutation({}),
    queryKeyInvalidation: pricingControllerFindAllQueryKey({
      // query: { page, search },
    }),
  })

  const handleDeletePricingGroup = async (id: string) => {
    await remove.mutateAsync({
      path: { id },
      query: { directDelete: true },
    })
  }

  return (
    <SimpleGrid cols={2}>
      {meta.totalCount === 0 ? (
        <Text c="dimmed" ta="center">
          No fee clusters found.
        </Text>
      ) : (
        pricingGroups.map((cluster) => (
          <Paper withBorder key={cluster.id} radius="lg">
            {/* Header Bar */}
            <Box px="lg" py="sm">
              <Group justify="space-between">
                <Text fw={600} size="md">
                  {cluster.name}
                </Text>
                <Group>
                  <Switch color="teal" checked={cluster.enabled} />
                  <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={() => handleOpenDrawer(cluster.id)}
                  >
                    <IconEdit size={18} />
                  </ActionIcon>

                  <ActionIcon
                    variant="subtle"
                    radius="md"
                    onClick={() => handleDeletePricingGroup(cluster.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Group>
              </Group>
            </Box>

            <Divider />

            {/* Fee Breakdown */}
            <Stack px="lg" py="md" gap="xs">
              <Group gap="xs" mb="xs">
                {cluster.prices.map((fee) => (
                  <Badge
                    key={fee.id}
                    color="teal"
                    variant="default"
                    radius="md"
                    size="sm"
                    leftSection={<IconCheck size={14} />}
                  >
                    {fee.name}
                  </Badge>
                ))}
              </Group>
              {/* <Divider size={'sm'} variant="dashed" /> */}
              <Stack gap={4}>
                {cluster.prices.map((fee) => (
                  <Group key={fee.id} justify="space-between" px={2} py={2}>
                    <Group gap={4}>
                      <Text size="sm" fw={500} c="dimmed">
                        {fee.name}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c={'dimmed'}>
                      ₱ {new Decimal(fee.amount).toString()}
                    </Text>
                  </Group>
                ))}
              </Stack>
              {/* <Divider size={'sm'} variant="dashed" /> */}
              <Group justify="flex-end">
                <Text size="sm" fw={600}>
                  Total: ₱{' '}
                  {cluster.prices
                    .reduce(
                      (sum, f) => sum.add(new Decimal(f.amount)),
                      new Decimal(0),
                    )
                    .toLocaleString()}
                </Text>
              </Group>
            </Stack>
          </Paper>
        ))
      )}
    </SimpleGrid>
  )
}

function GroupedFeeFormDrawer() {
  const { createGroup, updateGroup } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (state: boolean) => {
    navigate({
      search: {
        createGroup: state ? state : undefined,
      },
    })
  }

  return (
    <>
      <Button
        variant="filled"
        radius={'md'}
        leftSection={<IconPlus size={20} />}
        lts={rem(0.25)}
        onClick={() => handleDrawerState(true)}
      >
        Create
      </Button>

      <Drawer
        opened={createGroup === true || updateGroup !== undefined}
        onClose={() => handleDrawerState(false)}
        title={
          <Text size="xl" fw={600}>
            Create Grouped Fees
          </Text>
        }
        position="right"
        size="md"
        // overlayProps={{ opacity: 0.2, blur: 2 }}
        padding="xl"
      >
        <GroupedFeeForm />
      </Drawer>
    </>
  )
}

function GroupedFeeForm() {
  const { createGroup, updateGroup } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (state: boolean) => {
    navigate({
      search: {
        createGroup: state ? state : undefined,
      },
    })
  }

  const uuidSchema = z.uuidv4()

  const { create, update, form, isPending } = useQuickForm<
    PricingGroupFormInput,
    PricingGroupFormOutput
  >()({
    name: 'pricing group',
    formOptions: {
      initialValues: {
        name: '',
        pricings: [],
      },
      validate: zod4Resolver(pricingGroupFormSchema),
    },
    transformQueryData: (pricingGroup) => ({
      name: pricingGroup.name,
      pricings: pricingGroup.prices,
    }),
    queryOptions: {
      ...pricingGroupControllerFindOneOptions({
        path: { id: updateGroup || '' },
      }),
      enabled: uuidSchema.safeParse(updateGroup).success,
    },
    createMutationOptions: pricingGroupControllerCreateMutation({}),
    updateMutationOptions: pricingGroupControllerUpdateMutation({
      path: { id: updateGroup || '' },
    }),
    queryKeyInvalidation: pricingGroupControllerFindAllQueryKey({
      // query: { page, search },
    }),
  })

  const handleCreatePricingGroup = async () => {
    if (form.validate().hasErrors) return

    const { name, pricings: includedFees } = form.getValues()

    const amount = includedFees
      .reduce(
        (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
        new Decimal(0),
      )
      .toString()

    const pricings = includedFees.map((fee) => fee.id)

    await create.mutateAsync({
      body: {
        group: {
          name,
          amount,
        },
        pricings,
      },
    })

    handleDrawerState(false)
  }

  const handleUpdatePricingGroup = async () => {
    if (!updateGroup || form.validate().hasErrors) return

    const { name, pricings: includedFees } = form.getValues()

    const amount = includedFees
      .reduce(
        (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
        new Decimal(0),
      )
      .toString()

    const pricings = includedFees.map((fee) => fee.id)

    await update.mutateAsync({
      path: { id: updateGroup },
      body: {
        group: {
          name,
          amount,
        },
        pricings,
      },
    })

    handleDrawerState(false)
  }

  return (
    <Stack gap="md">
      <TextInput
        label="Template Name"
        placeholder="Name"
        radius="md"
        withAsterisk
        disabled={isPending}
        key={form.key('name')}
        {...form.getInputProps('name')}
      />
      <GroupedIncludedFeesForm
        disabled={isPending}
        defaultFees={form.getValues().pricings}
        onAdd={(id) => {
          form.setFieldValue('includedFees', [...form.getValues().pricings, id])
        }}
        onRemove={(id) => {
          form.setFieldValue(
            'includedFees',
            form.getValues().pricings.filter((item) => item !== id),
          )
        }}
      />
      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          disabled={isPending}
          onClick={() => handleDrawerState(false)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          onClick={() =>
            createGroup
              ? handleCreatePricingGroup()
              : handleUpdatePricingGroup()
          }
        >
          Save Changs
        </Button>
      </Group>
    </Stack>
  )
}

function IndividualFeesTab() {
  return (
    <Stack>
      <Group justify="end" wrap="wrap" gap={'xs'}>
        <TextInput
          placeholder="Search individual fee"
          radius={'md'}
          leftSection={<IconSearch size={18} stroke={1} />}
          w={rem(250)}
        />
        <IndividualFeeFormDrawer />
      </Group>
      <IndividualFeesList />
    </Stack>
  )
}

function IndividualFeesList() {
  const navigate = route.useNavigate()

  const handleOpenDrawer = (id: string) => {
    navigate({
      search: {
        updateFee: id,
      },
    })
  }

  const { data } = useSuspenseQuery(pricingControllerFindAllOptions())

  const { pricings, meta } = data

  const { remove } = useQuickAction({
    name: 'pricing',
    removeMutationOptions: pricingControllerRemoveMutation({}),
    queryKeyInvalidation: pricingControllerFindAllQueryKey({
      // query: { page, search },
    }),
  })

  const handleDeletePricing = async (id: string) => {
    await remove.mutateAsync({
      path: { id },
      query: { directDelete: true },
    })
  }

  return (
    <SimpleGrid cols={3}>
      {meta.totalCount === 0 ? (
        <Text c="dimmed" ta="center">
          No fee templates found.
        </Text>
      ) : (
        pricings.map((template) => (
          <Paper withBorder key={template.id} p={0} radius="lg">
            <Box px="lg" py="sm">
              <Group justify="space-between">
                <Group gap={8}>
                  <Text fw={600} size="md">
                    {template.name}
                  </Text>
                </Group>
                <Badge
                  color={template.enabled ? 'green' : 'gray'}
                  variant="dot"
                  size="md"
                  radius="sm"
                >
                  {template.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </Group>
            </Box>

            <Divider />

            <Group px="lg" py="md" justify="space-between" align="center">
              <Group gap={6}>
                <Text>₱ {new Decimal(template.amount).toString()}</Text>
              </Group>
              <Group>
                <Switch color="teal" defaultChecked={template.enabled} />

                <ActionIcon
                  variant="subtle"
                  radius="md"
                  onClick={() => handleOpenDrawer(template.id)}
                >
                  <IconEdit size={18} />
                </ActionIcon>

                <ActionIcon
                  variant="subtle"
                  radius="md"
                  onClick={() => handleDeletePricing(template.id)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))
      )}
    </SimpleGrid>
  )
}

function IndividualFeeFormDrawer() {
  const { createFee, updateFee } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (state: boolean) => {
    navigate({
      search: {
        createFee: state ? state : undefined,
      },
    })
  }
  return (
    <>
      <Button
        variant="filled"
        radius={'md'}
        leftSection={<IconPlus size={20} />}
        lts={rem(0.25)}
        onClick={() => handleDrawerState(true)}
      >
        Create
      </Button>

      <Drawer
        opened={createFee === true || updateFee !== undefined}
        onClose={() => handleDrawerState(false)}
        title={
          <Text size="xl" fw={600}>
            {createFee ? 'Create' : 'Update'} Individual Fee
          </Text>
        }
        position="right"
        size="md"
        padding="xl"
      >
        <IndividualFeeForm />
      </Drawer>
    </>
  )
}

function IndividualFeeForm() {
  const { createFee, updateFee } = route.useSearch()
  const navigate = route.useNavigate()

  const handleDrawerState = (state: boolean) => {
    navigate({
      search: {
        createFee: state ? state : undefined,
      },
    })
  }

  const { create, update, form, isPending } = useQuickForm<
    PricingFormInput,
    PricingFormOutput
  >()({
    name: 'pricing',
    formOptions: {
      initialValues: {
        name: '',
        amount: '',
        type: null,
      },
      validate: zod4Resolver(pricingFormSchema),
    },
    transformQueryData: (pricing) => ({
      name: pricing.name,
      amount: pricing.amount,
      type: pricing.type,
    }),
    queryOptions: {
      ...pricingControllerFindOneOptions({
        path: { id: updateFee || '' },
      }),
      enabled: !!updateFee,
    },
    createMutationOptions: pricingControllerCreateMutation({}),
    updateMutationOptions: pricingControllerUpdateMutation({
      path: { id: updateFee || '' },
    }),
    queryKeyInvalidation: pricingControllerFindAllQueryKey({
      // query: { page, search },
    }),
  })

  const handleCreatePricing = async () => {
    if (form.validate().hasErrors) return

    const { name, type, amount } = form.getValues()

    if (!type) return

    await create.mutateAsync({
      body: {
        type: type,
        name: name,
        amount: amount,
      },
    })

    handleDrawerState(false)
  }

  const handleUpdatePricing = async () => {
    if (!updateFee || form.validate().hasErrors) return

    const { name, type, amount } = form.getValues()

    if (!type) return

    await update.mutateAsync({
      path: { id: updateFee },
      body: {
        type: type,
        name: name,
        amount: amount,
      },
    })

    handleDrawerState(false)
  }

  const pricingTypes: { label: string; value: PricingType }[] = [
    { label: 'Tuition', value: 'tuition' },
    { label: 'Laboratory', value: 'lab' },
    { label: 'Miscellaneous', value: 'misc' },
    { label: 'Other', value: 'other' },
  ]

  return (
    <Stack gap="md">
      <TextInput
        label="Template Name"
        placeholder="Name"
        radius="md"
        withAsterisk
        disabled={isPending}
        key={form.key('name')}
        {...form.getInputProps('name')}
      />
      <Select
        label="Fee Type"
        placeholder="Select fee type"
        data={pricingTypes}
        withAsterisk
        disabled={isPending}
        key={form.key('type')}
        {...form.getInputProps('type')}
      />
      <TextInput
        label="Fee Amount (₱)"
        placeholder="0.00"
        type="number"
        radius="md"
        required
        min={0}
        disabled={isPending}
        key={form.key('amount')}
        {...form.getInputProps('amount')}
      />
      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          onClick={() => handleDrawerState(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={() =>
            createFee ? handleCreatePricing() : handleUpdatePricing()
          }
          disabled={isPending}
        >
          Save Changes
        </Button>
      </Group>
    </Stack>
  )
}

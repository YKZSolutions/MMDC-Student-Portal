import {
  pricingFormSchema,
  type PricingFormInput,
  type PricingFormOutput,
} from '@/features/pricing/pricing-form.schema'
import { useQuickForm } from '@/hooks/use-quick-form'
import type { PricingDto, PricingType } from '@/integrations/api/client'
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
  pricingGroupControllerRemoveMutation,
  pricingGroupControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Combobox,
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
  useCombobox,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDebouncedValue, useInputState } from '@mantine/hooks'
import {
  IconCheck,
  IconEdit,
  IconMinus,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Router } from '@tanstack/react-router'
import Decimal from 'decimal.js'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { Suspense, useEffect, useState } from 'react'
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
        <GroupedFeeForm />
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

  const { mutateAsync: deleteItem } = useAppMutation(
    pricingGroupControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting pricing group',
        message: 'Please wait while the pricing group is being deleted.',
      },
      success: {
        title: 'Pricing Group Deleted',
        message: 'The pricing group has been deleted.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while deleting the pricing group.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: pricingGroupControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleDeletePricingGroup = async (id: string) => {
    await deleteItem({
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

  const { data: pricingGroup, isLoading } = useQuery({
    ...pricingGroupControllerFindOneOptions({
      path: { id: updateGroup || '' },
    }),
    enabled: uuidSchema.safeParse(updateGroup).success,
  })

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      includedFees: [] as PricingDto[],
    },
  })

  useEffect(() => {
    if (pricingGroup) {
      form.setValues({
        name: pricingGroup.name,
        includedFees: pricingGroup.prices,
      })
    } else {
      form.setValues({
        name: '',
        includedFees: [],
      })
    }
  }, [pricingGroup])

  const { mutateAsync: create, isPending: createPending } = useAppMutation(
    pricingGroupControllerCreateMutation,
    {
      loading: {
        title: 'Creating pricing group',
        message: 'Please wait while the pricing group is being created.',
      },
      success: {
        title: 'Pricing Group Created',
        message: 'The pricing group has been created.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while creating the pricing group.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: pricingGroupControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleCreatePricingGroup = async () => {
    if (form.validate().hasErrors) return

    const { name, includedFees } = form.getValues()

    const amount = includedFees
      .reduce(
        (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
        new Decimal(0),
      )
      .toString()

    const pricings = includedFees.map((fee) => fee.id)

    await create({
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

  const { mutateAsync: update, isPending: updatePending } = useAppMutation(
    pricingGroupControllerUpdateMutation,
    {
      loading: {
        title: 'Updating pricing group',
        message: 'Please wait while the pricing group is being updated.',
      },
      success: {
        title: 'Pricing Group Updated',
        message: 'The pricing group has been updated.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while updating the pricing group.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: pricingGroupControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleUpdatePricingGroup = async () => {
    if (!updateGroup || form.validate().hasErrors) return

    const { name, includedFees } = form.getValues()

    const amount = includedFees
      .reduce(
        (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
        new Decimal(0),
      )
      .toString()

    const pricings = includedFees.map((fee) => fee.id)

    await update({
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
        <Stack gap="md">
          <TextInput
            label="Template Name"
            placeholder="Name"
            radius="md"
            withAsterisk
            disabled={isLoading || createPending || updatePending}
            key={form.key('name')}
            {...form.getInputProps('name')}
          />
          <GroupedIncludedFeesForm
            disabled={isLoading || createPending || updatePending}
            defaultFees={form.getValues().includedFees}
            onAdd={(id) => {
              form.setFieldValue('includedFees', [
                ...form.getValues().includedFees,
                id,
              ])
            }}
            onRemove={(id) => {
              form.setFieldValue(
                'includedFees',
                form.getValues().includedFees.filter((item) => item !== id),
              )
            }}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              disabled={isLoading || createPending || updatePending}
              onClick={() => handleDrawerState(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || createPending || updatePending}
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
      </Drawer>
    </>
  )
}

interface GroupedIncludedFeesFormProps {
  disabled: boolean
  defaultFees?: PricingDto[]
  onAdd: (pricing: PricingDto) => void
  onRemove: (pricing: PricingDto) => void
}

function GroupedIncludedFeesForm({
  disabled,
  defaultFees,
  onAdd,
  onRemove,
}: GroupedIncludedFeesFormProps) {
  const [fees, setFees] = useState(defaultFees || [])

  useEffect(() => {
    if (defaultFees) setFees(defaultFees)
  }, [defaultFees])

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [value, setValue] = useInputState('')

  const [debouncedSearch] = useDebouncedValue(value, 300)
  const { data, isLoading } = useQuery({
    ...pricingControllerFindAllOptions({
      query: { search: debouncedSearch !== '' ? debouncedSearch : undefined },
    }),
    enabled: combobox.dropdownOpened,
  })

  const shouldFilterOptions =
    data && !data.pricings.some((item) => item.name === value)
  const filteredOptions = (
    shouldFilterOptions
      ? data.pricings.filter((item) =>
          item.name.toLowerCase().includes(value.toLowerCase().trim()),
        )
      : data?.pricings
  )?.filter((item) => !fees.some((fee) => fee.id === item.id))

  useEffect(() => {
    combobox.selectFirstOption()
  }, [value])

  return (
    <Stack>
      <Combobox
        onOptionSubmit={(optionValue) => {
          if (data) {
            const found = data.pricings.find(
              (price) => price.id === optionValue,
            )

            if (found) {
              setFees((prev) => [...prev, found])
              onAdd(found)
            }
          }
          setValue('')
          combobox.closeDropdown()
        }}
        store={combobox}
      >
        <Combobox.Target>
          <TextInput
            label="Included Fees"
            placeholder="Search"
            leftSection={<IconSearch size={18} stroke={1} />}
            value={value}
            onChange={(event) => {
              setValue(event)
              combobox.openDropdown()
              combobox.updateSelectedOptionIndex()
            }}
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            flex={1}
            disabled={disabled}
          />
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {isLoading ? (
              <Combobox.Empty>Fetching...</Combobox.Empty>
            ) : filteredOptions?.length === 0 ? (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            ) : (
              filteredOptions?.map((pricing) => (
                <Combobox.Option value={pricing.id} key={pricing.id}>
                  <Group justify="space-between">
                    <Text>{pricing.name}</Text>
                    <Text>₱{pricing.amount}</Text>
                  </Group>
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
      <Stack gap="xs">
        {fees.map((fee) => (
          <Group key={fee.id}>
            <Card radius="md" py={8} withBorder flex={1}>
              <Group justify="space-between">
                <Stack gap={2}>
                  <Text size="sm">{fee.name}</Text>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {fee.type}
                  </Text>
                </Stack>
                <Text size="sm">₱{fee.amount}</Text>
              </Group>
            </Card>
            <ActionIcon
              size="sm"
              variant="outline"
              radius="lg"
              onClick={() => {
                onRemove(fee)
                setFees((prev) => prev.filter((item) => item.id !== fee.id))
              }}
              disabled={disabled}
            >
              <IconMinus />
            </ActionIcon>
          </Group>
        ))}
        <Divider />
        <Group mr={36}>
          <Card radius="md" py={8} flex={1}>
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                Total
              </Text>

              <Text size="sm" fw={500}>
                ₱
                {fees
                  .reduce(
                    (acc, val) => new Decimal(acc).add(new Decimal(val.amount)),
                    new Decimal(0),
                  )
                  .toString()}
              </Text>
            </Group>
          </Card>
        </Group>
      </Stack>
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
        <IndividualFeeForm />
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

  const { mutateAsync: deleteItem } = useAppMutation(
    pricingControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting pricing',
        message: 'Please wait while the pricing is being deleted.',
      },
      success: {
        title: 'Pricing Deleted',
        message: 'The pricing has been deleted.',
      },
      error: {
        title: 'Failed',
        message: 'Something went wrong while deleting the pricing.',
      },
    },
    {
      onSuccess: () => {
        const { queryClient } = getContext()

        queryClient.invalidateQueries({
          queryKey: pricingControllerFindAllQueryKey(),
        })
      },
    },
  )

  const handleDeletePricing = async (id: string) => {
    await deleteItem({
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
    name: 'course',
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

  console.log(form.getValues())

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
      </Drawer>
    </>
  )
}

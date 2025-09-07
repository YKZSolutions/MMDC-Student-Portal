import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  MultiSelect,
  Paper,
  rem,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconCheck,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'

type IndividualFee = {
  id: string
  name: string
  fee: number
}

type FeeCluster = {
  id: string
  name: string
  enabled: boolean
  fees: IndividualFee[]
}

type FeeTemplate = IndividualFee & { enabled: boolean; category: string }

const initialTemplates: FeeTemplate[] = [
  {
    id: '1',
    name: 'Tuition Fee',
    fee: 25000,
    enabled: true,
    category: 'Tuition',
  },
  {
    id: '2',
    name: 'Laboratory Fee',
    fee: 3500,
    enabled: false,
    category: 'Laboratory',
  },
  {
    id: '3',
    name: 'Library Fee',
    fee: 1200,
    enabled: true,
    category: 'Library',
  },
]

const initialClusters: FeeCluster[] = [
  {
    id: 'c1',
    name: 'Enrollment Bundle',
    enabled: true,
    fees: [
      { id: '1', name: 'Tuition Fee', fee: 25000 },
      { id: '2', name: 'Laboratory Fee', fee: 3500 },
    ],
  },
  {
    id: 'c2',
    name: 'Enrollment Bundle 2',
    enabled: true,
    fees: [
      { id: '1', name: 'Tuition Fee', fee: 30000 },
      { id: '2', name: 'Laboratory Fee', fee: 4000 },
    ],
  },
  {
    id: 'c3',
    name: 'Enrollment Bundle 3',
    enabled: true,
    fees: [
      { id: '1', name: 'Tuition Fee', fee: 35000 },
      { id: '2', name: 'Laboratory Fee', fee: 4500 },
    ],
  },
]

function PricingPage() {
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
          defaultValue={'clustered'}
          radius="md"
          color="teal"
          keepMounted={false}
          variant="outline"
        >
          <Tabs.List mb={'lg'}>
            <Tabs.Tab value="clustered">Clustered Fees</Tabs.Tab>
            <Tabs.Tab value="individual">Individual Fees</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="clustered">
            <Stack>
              <Group justify="end" wrap="wrap" gap={'xs'}>
                <TextInput
                  placeholder="Search clustered fee"
                  radius={'md'}
                  leftSection={<IconSearch size={18} stroke={1} />}
                  w={rem(250)}
                />
                <CreateClusteredFee />
              </Group>
              <ClusteredFeesTab clusters={initialClusters} />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="individual">
            <Stack>
              <Group justify="end" wrap="wrap" gap={'xs'}>
                <TextInput
                  placeholder="Search individual fee"
                  radius={'md'}
                  leftSection={<IconSearch size={18} stroke={1} />}
                  w={rem(250)}
                />
                <CreateIndividualFee />
              </Group>
              <IndividualFeesTab />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

function CreateClusteredFee() {
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)

  return (
    <>
      <Button
        variant="filled"
        radius={'md'}
        leftSection={<IconPlus size={20} />}
        lts={rem(0.25)}
        onClick={openDrawer}
      >
        Create
      </Button>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title={
          <Text size="xl" fw={600}>
            Create Clustered Fees
          </Text>
        }
        position="right"
        size="md"
        overlayProps={{ opacity: 0.2, blur: 2 }}
        padding="xl"
      >
        <Stack gap="md">
          <TextInput label="Template Name" radius="md" required />
          <MultiSelect
            searchable
            label="Included Fees"
            data={initialTemplates.map((f) => ({
              value: f.id,
              label: f.name,
            }))}
            radius="md"
            required
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  )
}

function ClusteredFeesTab({ clusters }: { clusters: FeeCluster[] }) {
  return (
    <Stack gap="md">
      {clusters.length === 0 ? (
        <Text c="dimmed" ta="center">
          No fee clusters found.
        </Text>
      ) : (
        clusters.map((cluster) => (
          <Paper withBorder key={cluster.id} radius="lg">
            {/* Header Bar */}
            <Box px="lg" py="sm">
              <Group justify="space-between">
                <Text fw={600} size="md">
                  {cluster.name}
                </Text>
                <ClusterFeeActions
                  cluster={cluster}
                  individualFees={initialTemplates}
                />
              </Group>
            </Box>

            <Divider />

            {/* Fee Breakdown */}
            <Stack px="lg" py="md" gap="xs">
              <Group gap="xs" mb="xs">
                {cluster.fees.map((fee) => (
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
              <Divider size={'sm'} variant="dashed" />
              <Stack gap={4}>
                {cluster.fees.map((fee) => (
                  <Group key={fee.id} justify="space-between" px={2} py={2}>
                    <Group gap={4}>
                      <Text size="sm" fw={500} c="dimmed">
                        {fee.name}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600} c={'dimmed'}>
                      ₱ {fee.fee.toLocaleString()}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Divider size={'sm'} variant="dashed" />
              <Group justify="flex-end">
                <Text size="sm" fw={600}>
                  Total: ₱{' '}
                  {cluster.fees
                    .reduce((sum, f) => sum + f.fee, 0)
                    .toLocaleString()}
                </Text>
              </Group>
            </Stack>
          </Paper>
        ))
      )}
    </Stack>
  )
}

function CreateIndividualFee() {
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)

  return (
    <>
      <Button
        variant="filled"
        radius={'md'}
        leftSection={<IconPlus size={20} />}
        lts={rem(0.25)}
        onClick={openDrawer}
      >
        Create
      </Button>

      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title={
          <Text size="xl" fw={600}>
            Create Individual Fee
          </Text>
        }
        position="right"
        size="md"
        overlayProps={{ opacity: 0.2, blur: 2 }}
        padding="xl"
      >
        <Stack gap="md">
          <TextInput label="Template Name" radius="md" required />
          <TextInput
            label="Fee Amount (₱)"
            type="number"
            radius="md"
            required
            min={0}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  )
}

function IndividualFeesTab() {
  return (
    <Stack gap="md">
      {initialTemplates.length === 0 ? (
        <Text c="dimmed" ta="center">
          No fee templates found.
        </Text>
      ) : (
        initialTemplates.map((template) => (
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
                <Text>₱ {template.fee.toLocaleString()}</Text>
              </Group>
              <IndividualFeeActions />
            </Group>
          </Paper>
        ))
      )}
    </Stack>
  )
}

function IndividualFeeActions() {
  const [drawerOpen, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)
  return (
    <>
      {/* Individual Fee Item Actions */}
      <Group>
        <Switch color="teal" />

        <ActionIcon onClick={openDrawer} variant="subtle" radius="md">
          <IconEdit size={18} />
        </ActionIcon>

        <ActionIcon variant="subtle" radius="md">
          <IconTrash size={18} />
        </ActionIcon>
      </Group>
      <Drawer
        opened={drawerOpen}
        onClose={closeDrawer}
        title={
          <Text size="xl" fw={600}>
            Edit Fee Template
          </Text>
        }
        position="right"
        size="md"
        overlayProps={{ opacity: 0.2, blur: 2 }}
        padding="xl"
      >
        <Stack gap="md">
          <TextInput label="Template Name" radius="md" required />
          <TextInput
            label="Fee Amount (₱)"
            type="number"
            radius="md"
            required
            min={0}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  )
}

function ClusterFeeActions({
  cluster,
  individualFees,
}: {
  cluster: FeeCluster
  individualFees: IndividualFee[]
}) {
  const [
    editClusterDrawerOpen,
    { open: openEditClusterDrawer, close: closeEditClusterDrawer },
  ] = useDisclosure(false)

  return (
    <>
      {/* Cluster Fee Item Actions */}
      <Group>
        <Switch color="teal" />
        <ActionIcon
          variant="subtle"
          radius="md"
          onClick={openEditClusterDrawer}
        >
          <IconEdit size={18} />
        </ActionIcon>

        <ActionIcon variant="subtle" radius="md">
          <IconTrash size={18} />
        </ActionIcon>
      </Group>

      <Drawer
        opened={editClusterDrawerOpen}
        onClose={closeEditClusterDrawer}
        title={
          <Text size="xl" fw={600}>
            Edit Fee Cluster
          </Text>
        }
        position="right"
        size="md"
        overlayProps={{ opacity: 0.2, blur: 2 }}
        padding="xl"
      >
        <Stack gap="md">
          <TextInput
            label="Cluster Name"
            value={cluster.name}
            radius="md"
            required
          />
          <Select
            label="Included Fees"
            data={individualFees.map((f) => ({
              value: f.id,
              label: `${f.name} (₱${f.fee.toLocaleString()})`,
            }))}
            value={cluster.fees.map((f) => f.id).join(',')}
            radius="md"
            searchable
            clearable={false}
            multiple
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeEditClusterDrawer}>
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </Group>
        </Stack>
      </Drawer>
    </>
  )
}

export default PricingPage

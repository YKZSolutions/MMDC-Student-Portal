import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import type { IFrontendBillingCostBreakdown } from '@/features/billing/types'
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Drawer,
  Flex,
  Group,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconArrowLeft,
  IconCalendarEvent,
  IconCash,
  IconFileInvoice,
  IconMail,
  IconPlus,
  IconReceipt2,
  IconReportMoney,
  IconSchool,
  IconUpload,
  IconUser,
} from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'

const bills = {
  bill_no: '8229',
  due_date: '10-03-2023',
  amount: 16632.0,
  outstanding: 0.0,
  status: 'settled',
  payer_details: {
    payer_name: 'Test Namezuela',
    receivable: 16632.0,
    receipted: 16632.0,
    refund: 0.0,
    discount: 0.0,
    outstanding_amount: 0.0,
    invoice_no: 'P60009',
  },
  fees: [
    {
      id: '1',
      category: 'Tuition Fee',
      name: 'Lec Subject/s',
      cost: "10696.0",
    },
    {
      id: '2',
      category: 'Tuition Fee',
      name: 'Lab Subject/s',
      cost: "7000.0",
    },
    {
      id: '3',
      category: 'Miscellaneous Fee',
      name: 'Campus Life Prog Fund',
      cost: "390.0",
    },
    {
      id: '4',
      category: 'Miscellaneous Fee',
      name: 'E-Resource Fee',
      cost: "675.0",
    },
    {
      id: '5',
      category: 'Miscellaneous Fee',
      name: 'Health Services Fee',
      cost: "465.0",
    },
    {
      id: '6',
      category: 'Miscellaneous Fee',
      name: 'IT Infrastructure Fee',
      cost: "2680.0",
    },
    {
      id: '7',
      category: 'Miscellaneous Fee',
      name: 'Library Fee',
      cost: "1205.0",
    },
    {
      id: '8',
      category: 'Miscellaneous Fee',
      name: 'Registration Fee',
      cost: "725.0",
    },
    {
      id: '9',
      category: 'Miscellaneous Fee',
      name: 'Student Council Fee',
      cost: "40.0",
    },
    {
      id: '10',
      category: 'Miscellaneous Fee',
      name: 'Supplementary Fee',
      cost: "735.0",
    },
  ] as IFrontendBillingCostBreakdown[],
}

const paymentHistory = [
  {
    id: 'pay_1A2B3C4D',
    title: 'Payment Settled',
    description:
      'Payment of $8,887.50 for invoice #8229 has been successfully processed.',
    amount: 8887.5,
    status: 'settled',
    timestamp: '2023-10-03T14:30:00Z',
  },
  {
    id: 'pay_5E6F7G8H',
    title: 'Invoice Paid',
    description:
      'Invoice #11012 for the amount of $20,580.75 was paid in full.',
    amount: 20580.75,
    status: 'settled',
    timestamp: '2023-08-29T09:15:00Z',
  },
  {
    id: 'pay_9I0J1K2L',
    title: 'Payment Scheduled',
    description: 'A payment of $5,000.00 is scheduled for invoice #12345.',
    amount: 5000.0,
    status: 'pending',
    timestamp: '2024-01-20T11:00:00Z',
  },
]

const route = getRouteApi('/(protected)/billing/$billingId')

function BillingIdPage() {
  const navigate = useNavigate()
  const { billingId } = route.useParams()

  const [opened, { open, close }] = useDisclosure(false)

  const { authUser } = useAuth('protected')

  return (
    <Container size={'md'} pb={'lg'} w={'100%'}>
      <Flex align={'center'} pb={'lg'}>
        <Group>
          <ActionIcon
            radius={'xl'}
            variant="subtle"
            size={'lg'}
            onClick={() =>
              navigate({
                to: '..',
              })
            }
          >
            <IconArrowLeft />
          </ActionIcon>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Billing Details
          </Title>
        </Group>
        <Group align={'center'} gap={'sm'} ml={'auto'}>
          <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
            // onClick={() => mutateIntent()}
          >
            Export
          </Button>
          <RoleComponentManager
            currentRole={authUser.role}
            roleRender={{
              student: (
                <Button
                  variant="filled"
                  radius={'md'}
                  leftSection={<IconPlus size={20} />}
                  lts={rem(0.25)}
                  onClick={() =>
                    // mutateMethod({
                    //   name: 'Jose Rizal',
                    //   email: 'joserizal@gmail.com',
                    //   phone: '09000000000',
                    //   metadata: {
                    //     key: 'value',
                    //     key2: 'value',
                    //   },
                    // })
                    modals.openContextModal({
                      modal: 'ewallet',
                      innerProps: {
                        amount: 20000,
                        billingId,
                      },
                    })
                  }
                >
                  Pay Bill
                </Button>
              ),
            }}
          />

          {/* <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
            onClick={() => mutateAttach(dataIntent)}
          >
            Attach
          </Button> */}
        </Group>
      </Flex>

      <Drawer
        position="right"
        opened={opened}
        onClose={close}
        title={
          <Title order={4} fw={500}>
            Payment History
          </Title>
        }
      >
        <Timeline active={1} bulletSize={24}>
          {paymentHistory.map((history) => (
            <Timeline.Item title={history.title}>
              <Text c="dimmed" size="sm">
                {history.description}
              </Text>
              <Text size="xs" mt={4}>
                {dayjs(history.timestamp).format('MMM D, YYYY')}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Drawer>

      <Stack>
        <BillingPrefaceDetails />
        <BillingFeeBreakdown open={open} fees={bills.fees} />
      </Stack>
    </Container>
  )
}

const billingDetails = [
  {
    label: 'Invoice ID',
    value: 'P60009',
    icon: IconFileInvoice,
  },
  {
    label: 'Payer Name',
    value: 'Test Namezuela',
    icon: IconUser,
  },
  {
    label: 'Payer Email',
    value: 'test@email.com',
    icon: IconMail,
  },
  {
    label: 'Due Date',
    value: 'February 24, 2025',
    icon: IconCalendarEvent,
  },
  {
    label: 'Bill Type',
    value: 'Tuition Fee',
    icon: IconSchool,
  },
  {
    label: 'Receivable Amount',
    value: '16,632.0',
    icon: IconCash,
  },
  {
    label: 'Receipted Amount',
    value: '16,632.0',
    icon: IconReceipt2,
  },
  {
    label: 'Outstanding Amount',
    value: 0,
    icon: IconReportMoney,
  },
]

export function BillingPrefaceDetails() {
  const midIndex = Math.ceil(billingDetails.length / 2)
  const firstHalf = billingDetails.slice(0, midIndex)
  const secondHalf = billingDetails.slice(midIndex)

  return (
    <SimpleGrid cols={{ lg: 2, xl: 2, md: 2 }}>
      {[firstHalf, secondHalf].map((details, idx) => (
        <Card key={idx} withBorder p="lg" radius="md">
          <SimpleGrid
            h="100%"
            cols={{
              // xl: 3, lg: 3,
              xs: 2,
              base: 1,
            }}
            spacing={'xl'}
          >
            {details.map((detail) => (
              <Group key={detail.label} wrap="nowrap">
                <ThemeIcon
                  variant="light"
                  radius="xl"
                  color="dark.2"
                  p={rem(3)}
                >
                  <detail.icon />
                </ThemeIcon>
                <Stack gap={rem(3)}>
                  <Text c="dimmed" fz="xs">
                    {detail.label}
                  </Text>
                  <Text fw={500} size="sm">
                    {detail.value}
                  </Text>
                </Stack>
              </Group>
            ))}
          </SimpleGrid>
        </Card>
      ))}
    </SimpleGrid>
  )
}

export default BillingIdPage

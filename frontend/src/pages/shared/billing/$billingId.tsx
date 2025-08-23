import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import { mapBillingDetails } from '@/features/billing/helpers'
import type { IFrontendBillingCostBreakdown } from '@/features/billing/types'
import type { DetailedBillDto } from '@/integrations/api/client'
import { billingControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
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
  IconPlus,
  IconUpload,
  type ReactNode
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Suspense } from 'react'

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

function BillingIdQueryProvider({
  children,
}: {
  children: (props: { currentInvoice: DetailedBillDto }) => ReactNode
}) {
  const { data } = useSuspenseQuery(
    billingControllerFindOneOptions({
      path: { id: route.useParams().billingId },
    }),
  )

  const currentInvoice = data as DetailedBillDto

  console.log('currentInvoice', currentInvoice)

  return children({
    currentInvoice,
  })
}

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
        <Suspense fallback={<></>}>
          <BillingIdQueryProvider>
            {({ currentInvoice }) => (
              <BillingPrefaceDetails invoice={currentInvoice} />
            )}
          </BillingIdQueryProvider>
        </Suspense>
        <Suspense fallback={<></>}>
          <BillingIdQueryProvider>
            {({ currentInvoice }) => (
              <BillingFeeBreakdown
                open={open}
                fees={
                  currentInvoice.costBreakdown as unknown as IFrontendBillingCostBreakdown[]
                }
              />
            )}
          </BillingIdQueryProvider>
        </Suspense>
      </Stack>
    </Container>
  )
}

export function BillingPrefaceDetails({ invoice }: { invoice: DetailedBillDto }) {
  const billingDetails = mapBillingDetails(invoice)

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
                <Stack gap={rem(3)} className="truncate">
                  <Text c="dimmed" fz="xs">
                    {detail.label}
                  </Text>
                  <Text fw={500} size="sm" truncate>
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

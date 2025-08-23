import { useAuth } from '@/features/auth/auth.hook'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import { mapBillingDetails } from '@/features/billing/helpers'
import type { BillPaymentDto, DetailedBillDto } from '@/integrations/api/client'
import {
  billingControllerFindOneOptions,
  paymentsControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Drawer,
  Flex,
  Group,
  NumberFormatter,
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
import { IconArrowLeft, IconUpload, type ReactNode } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
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

function BillingPaymentHistoryQueryProvider({
  children,
}: {
  children: (props: { paymentHistory: BillPaymentDto[] }) => ReactNode
}) {
  const { data } = useSuspenseQuery(
    paymentsControllerFindAllOptions({
      path: {
        billId: route.useParams().billingId,
      },
    }),
  )

  const paymentHistory = data

  return children({
    paymentHistory,
  })
}

function BillingIdPage() {
  const navigate = useNavigate()

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
        <Suspense fallback={<></>}>
          <BillingPaymentHistoryQueryProvider>
            {(props) => (
              <Timeline active={props.paymentHistory.length} bulletSize={24}>
                {props.paymentHistory.map((history) => (
                  <Timeline.Item key={history.id} title="Payment Received">
                    <Text c="dimmed" size="sm">
                      Paid{' '}
                      <Text fw={600} component="span" inherit>
                        <NumberFormatter
                          value={history.amountPaid}
                          prefix="₱ "
                          thousandSeparator
                        />
                      </Text>{' '}
                      via{' '}
                      <Text fw={600} component="span" inherit>
                        {history.paymentType.toUpperCase()}
                      </Text>
                    </Text>

                    <Text size="xs" mt={4}>
                      {dayjs(history.paymentDate).format(
                        'ddd, MMM D, YYYY h:mm A',
                      )}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </BillingPaymentHistoryQueryProvider>
        </Suspense>
      </Drawer>

      <Stack gap={'lg'}>
        <Suspense fallback={<></>}>
          <BillingIdQueryProvider>
            {({ currentInvoice }) => (
              <BillingPrefaceDetails invoice={currentInvoice} />
            )}
          </BillingIdQueryProvider>
        </Suspense>

        <Group grow align="flex-start" gap={'lg'}>
          <Suspense fallback={<></>}>
            <BillingIdQueryProvider>
              {({ currentInvoice }) => (
                <Stack gap={'xs'}>
                  <Text fw={500}>Billing Breakdown</Text>
                  <BillingFeeBreakdown
                    open={open}
                    fees={currentInvoice.costBreakdown}
                  />
                </Stack>
              )}
            </BillingIdQueryProvider>
          </Suspense>
          <Suspense fallback={<></>}>
            <BillingIdQueryProvider>
              {({ currentInvoice }) => (
                <Stack gap={'xs'}>
                  <Text fw={500}>Installments</Text>
                  <BillingInstallments invoice={currentInvoice} />
                </Stack>
              )}
            </BillingIdQueryProvider>
          </Suspense>
        </Group>
      </Stack>
    </Container>
  )
}

export function BillingPrefaceDetails({
  invoice,
}: {
  invoice: DetailedBillDto
}) {
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

function BillingInstallments({ invoice }: { invoice: DetailedBillDto }) {
  const { billingId } = route.useParams()

  return invoice.billInstallments.map((installment) => (
    <Card key={installment.id} withBorder px="lg" radius="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={rem(3)}>
          {/* Installment Name */}
          <Text size="sm" fw={600}>
            {installment.name}
          </Text>

          {/* Due Date */}
          <Text size="xs" c="dark.4">
            Due on{' '}
            {new Date(installment.dueAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {/* Amount */}
          <Text size="sm" fw={500} c="dark.7">
            <NumberFormatter
              value={installment.amountToPay}
              prefix="₱ "
              thousandSeparator
            />
          </Text>
        </Stack>

        <Button
          size="xs"
          disabled={installment.status === 'paid'}
          onClick={() =>
            modals.openContextModal({
              modal: 'ewallet',
              innerProps: {
                amount: Decimal(installment.amountToPay).mul(100).toNumber(),
                installmentId: installment.id,
                installmentOrder: installment.installmentOrder,
                description:
                  'Payment for installment ' +
                  installment.name +
                  ' of invoice #' +
                  invoice.invoiceId,
                statementDescriptor:
                  'MMDC Installment ' + `invoice #${invoice.invoiceId}`,
                billingId,
              },
            })
          }
        >
          {installment.status === 'paid' ? 'Paid' : 'Pay'}
        </Button>
      </Group>
    </Card>
  ))
}

export default BillingIdPage

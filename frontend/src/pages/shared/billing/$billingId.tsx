import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import BillingFeeBreakdown from '@/features/billing/billing-breakdown-table'
import { mapBillingDetails } from '@/features/billing/helpers'
import {
  SuspendedBillingBreakdown,
  SuspendedBillingInstallment,
  SuspendedBillingPreface,
} from '@/features/billing/suspense'
import type {
  BillInstallmentItemDto,
  BillPaymentDto,
  DetailedBillDto,
} from '@/integrations/api/client'
import {
  billingControllerFindOneOptions,
  installmentControllerFindAllOptions,
  paymentsControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Button,
  Card,
  Container,
  Drawer,
  Flex,
  Grid,
  Group,
  LoadingOverlay,
  NumberFormatter,
  rem,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Timeline,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import { IconArrowLeft, type ReactNode } from '@tabler/icons-react'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import Decimal from 'decimal.js'
import { Suspense } from 'react'

const route = getRouteApi('/(protected)/billing/$billingId')

function BillingIdQueryProvider({
  children,
}: {
  children: (props: {
    currentInvoice: DetailedBillDto
    currentInstallments: BillInstallmentItemDto[]
  }) => ReactNode
}) {
  const [{ data: billData }, { data: installmentData }] = useSuspenseQueries({
    queries: [
      billingControllerFindOneOptions({
        path: { id: route.useParams().billingId },
      }),
      installmentControllerFindAllOptions({
        path: {
          billId: route.useParams().billingId,
        },
      }),
    ],
  })

  const currentInvoice = billData

  const currentInstallments = installmentData as BillInstallmentItemDto[]

  return children({
    currentInvoice,
    currentInstallments,
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

  return (
    <Container size={'md'} pb={'lg'} w={'100%'}>
      <Flex
        gap={'sm'}
        direction={{
          base: 'column',
          xs: 'row',
        }}
        align={'start'}
        pb={'lg'}
        justify={'space-between'}
      >
        <Group gap={'sm'}>
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
        <Suspense
          fallback={
            <LoadingOverlay
              visible
              zIndex={1000}
              overlayProps={{ radius: 'sm', blur: 2 }}
            />
          }
        >
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
        <Suspense fallback={<SuspendedBillingPreface />}>
          <BillingIdQueryProvider>
            {({ currentInvoice }) => (
              <BillingPrefaceDetails invoice={currentInvoice} />
            )}
          </BillingIdQueryProvider>
        </Suspense>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Suspense
              fallback={
                <Stack gap={'xs'}>
                  <Skeleton height={rem(20)} w={rem(150)} />
                  <SuspendedBillingBreakdown />
                </Stack>
              }
            >
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
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Suspense
              fallback={
                <Stack gap={'xs'}>
                  <Skeleton height={rem(20)} w={rem(150)} />
                  <SuspendedBillingInstallment />
                </Stack>
              }
            >
              <BillingIdQueryProvider>
                {({ currentInvoice, currentInstallments }) => (
                  <Stack gap={'xs'}>
                    <Text fw={500}>Installments</Text>
                    <BillingInstallments
                      invoice={currentInvoice}
                      installments={currentInstallments}
                    />
                  </Stack>
                )}
              </BillingIdQueryProvider>
            </Suspense>
          </Grid.Col>
        </Grid>
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

function BillingInstallments({
  invoice,
  installments,
}: {
  invoice: DetailedBillDto
  installments: BillInstallmentItemDto[]
}) {
  const { billingId } = route.useParams()
  const { authUser } = useAuth('protected')

  return installments.map((installment) => (
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

        <RoleComponentManager
          currentRole={authUser.role}
          roleRender={{
            student: (
              <Button
                size="xs"
                disabled={installment.status === 'paid'}
                onClick={() =>
                  modals.openContextModal({
                    modal: 'ewallet',
                    innerProps: {
                      amount: Decimal(installment.amountToPay)
                        .mul(100)
                        .toNumber(),
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
            ),
          }}
        />
      </Group>
    </Card>
  ))
}

export default BillingIdPage

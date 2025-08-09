import RoleComponentManager from '@/components/role-component-manager'
import { useAuth } from '@/features/auth/auth.hook'
import type {
  IPaymentMethod,
  IPaymentMethodResponse,
} from '@/features/billing/types'
import { billingControllerCreateMutation } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Button,
  Container,
  Drawer,
  Flex,
  Group,
  NumberFormatter,
  Paper,
  rem,
  Stack,
  Table,
  Text,
  Timeline,
  Title,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@mantine/modals'
import {
  IconArrowLeft,
  IconHistory,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
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
      description: 'Lec Subject/s',
      amount: 10696.0,
    },
    {
      description: 'Lab Subject/s',
      amount: 7000.0,
    },
  ],
  miscellaneous_fees: [
    {
      description: 'Campus Life Prog Fund',
      amount: 390.0,
    },
    {
      description: 'E-Resource Fee',
      amount: 675.0,
    },
    {
      description: 'Health Services Fee',
      amount: 465.0,
    },
    {
      description: 'IT Infrastructure Fee',
      amount: 2680.0,
    },
    {
      description: 'Library Fee',
      amount: 1205.0,
    },
    {
      description: 'Registration Fee',
      amount: 725.0,
    },
    {
      description: 'Student Council Fee',
      amount: 40.0,
    },
    {
      description: 'Supplementary Fee',
      amount: 735.0,
    },
  ],
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

  // Payment Intent Creation
  const {
    mutate: mutateIntent,
    data: dataIntent,
    isPending,
  } = useMutation({
    mutationFn: () =>
      billingControllerCreateMutation().mutationFn!({
        body: {
          amount: 20000,
          billingId: billingId,
        },
      }),
  })

  // Payment Method Creation
  const { mutate: mutateMethod, data: dataMethod } = useMutation({
    mutationFn: async (
      payload: IPaymentMethod,
    ): Promise<IPaymentMethodResponse> => {
      const response = await fetch(
        'https://api.paymongo.com/v1/payment_methods',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${btoa(`${import.meta.env.VITE_PAYMONGO_PUBLIC_KEY}:`)}`, // replace with your actual secret key
          },
          body: JSON.stringify({
            data: {
              attributes: {
                type: 'gcash',
                billing: {
                  name: payload.name,
                  email: payload.email,
                  phone: payload.phone,
                },
                metadata: payload.metadata,
              },
            },
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(JSON.stringify(error))
      }

      return response.json()
    },
  })

  const { mutate: mutateAttach, data: dataAttach } = useMutation({
    mutationFn: async (payload) => {
      const response = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${dataIntent?.data.id}/attach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${btoa(`${import.meta.env.VITE_PAYMONGO_PUBLIC_KEY}:`)}`, // replace with your actual secret key
          },
          body: JSON.stringify({
            data: {
              attributes: {
                client_key: dataIntent?.data.attributes.client_key,
                payment_method: dataMethod?.data.id,
                return_url: 'http://localhost:3000/success',
              },
            },
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(JSON.stringify(error))
      }

      return response.json()
    },
  })

  console.log(dataIntent, dataMethod, dataAttach)

  const handleProceed = (selectedWallet: string | null) => {
    console.log('Selected E-wallet:', selectedWallet)
  }

  return (
    <Container size={'md'} pb={'lg'}>
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
                        handleProceed: handleProceed,
                      },
                    })
                  }
                >
                  Pay Bill
                </Button>
              ),
            }}
          />

          <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
            onClick={() => mutateAttach()}
          >
            Attach
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
        <BillingFeeBreakdown open={open} />
      </Stack>
    </Container>
  )
}

function BillingPrefaceDetails() {
  return (
    <Group align="start" justify="space-between">
      <Paper withBorder radius={'md'} className="flex-1/3">
        <Table
          styles={{
            td: {
              textAlign: 'end',
            },
            th: {
              backgroundColor: 'var(--mantine-color-gray-1)',
              color: 'var(--mantine-color-dark-7)',
            },
          }}
          style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
          variant="vertical"
          layout="fixed"
          withRowBorders={false}
        >
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={160}>Invoice ID</Table.Th>
              <Table.Td>P60009</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Th>Payer Name</Table.Th>
              <Table.Td>Test Namezuela</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Th>Payer Email</Table.Th>
              <Table.Td>test@email.com</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Th>Due Date</Table.Th>
              <Table.Td>February 24, 2025</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>
      <Paper withBorder radius={'md'} className="flex-1/3">
        <Table
          styles={{
            td: {
              textAlign: 'end',
            },
            th: {
              backgroundColor: 'var(--mantine-color-gray-1)',
              color: 'var(--mantine-color-dark-7)',
            },
          }}
          style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
          variant="vertical"
          layout="fixed"
          withRowBorders={false}
        >
          <Table.Tbody>
            <Table.Tr>
              <Table.Th w={160}>Bill Type</Table.Th>
              <Table.Td>Tuition Fee</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Receivable Amount</Table.Th>
              <Table.Td>16,632.00</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Th>Receipted Amount</Table.Th>
              <Table.Td>16,632.00</Table.Td>
            </Table.Tr>

            <Table.Tr>
              <Table.Th>Outstanding Amount</Table.Th>
              <Table.Td>0</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Paper>
    </Group>
  )
}

function BillingFeeBreakdown({ open }: { open: () => void }) {
  return (
    <Paper radius={'md'} withBorder>
      <Table
        verticalSpacing={'md'}
        highlightOnHover
        highlightOnHoverColor="gray.0"
        style={{ borderRadius: rem('5px'), overflow: 'hidden' }}
        styles={{
          th: {
            fontWeight: 500,
          },
        }}
      >
        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
            }}
            bg={'gray.1'}
            c={'dark.7'}
          >
            <Table.Th>Tuition Fees</Table.Th>
            <Table.Th>
              <Group w={'100%'}>
                <Button
                  size="xs"
                  ml={'auto'}
                  variant="outline"
                  radius={'md'}
                  leftSection={<IconHistory size={20} />}
                  c={'gray.7'}
                  color="gray.4"
                  lts={rem(0.25)}
                  onClick={() => open()}
                >
                  History
                </Button>
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bills.fees.map((bill) => (
            <Table.Tr key={bill.description}>
              <Table.Td>{bill.description}</Table.Td>
              <Table.Td
                style={{
                  textAlign: 'end',
                }}
              >
                <NumberFormatter
                  prefix="₱ "
                  value={bill.amount}
                  thousandSeparator
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>

        <Table.Thead>
          <Table.Tr
            style={{
              border: '0px',
            }}
            bg={'gray.1'}
            c={'dark.5'}
          >
            <Table.Th>Miscellaneous Fees</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bills.miscellaneous_fees.map((misc) => (
            <Table.Tr key={misc.description}>
              <Table.Td>{misc.description}</Table.Td>
              <Table.Td
                style={{
                  textAlign: 'end',
                }}
              >
                <NumberFormatter
                  prefix="₱ "
                  value={misc.amount}
                  thousandSeparator
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>

        <Table.Tbody>
          <Table.Tr
            style={{
              border: '0px',
            }}
            bg={'gray.1'}
            c={'dark.7'}
          >
            <Table.Th>Total</Table.Th>
            <Table.Th
              style={{
                textAlign: 'end',
              }}
            >
              <NumberFormatter prefix="₱ " value={30000} thousandSeparator />
            </Table.Th>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  )
}

export default BillingIdPage

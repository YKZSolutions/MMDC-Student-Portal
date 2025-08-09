import type { PaymentIntentDataDto } from '@/integrations/api/client'
import { billingControllerCreateOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Button,
  Card,
  Group,
  Image,
  LoadingOverlay,
  rem,
  Stack,
  Text,
  Transition,
} from '@mantine/core'
import type { ContextModalProps } from '@mantine/modals'
import { IconCheck } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

const ewallets = [
  {
    name: 'Maya',
    value: 'paymaya',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Maya_logo.svg',
  },
  {
    name: 'GCash',
    value: 'gcash',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Gcash_logo.png',
  },
]

interface IEwalletModalQueryProvider {
  amount: number
  billingId: string
}

function EwalletModalQueryProvider({
  children,
  props,
}: {
  children: (props: {
    data: PaymentIntentDataDto | undefined
    isFetching: boolean
    isPending: boolean
  }) => ReactNode
  props: IEwalletModalQueryProvider
}) {
  const { amount, billingId } = props

  // Payment Intent Creation
  const { data, isFetching, isPending } = useSuspenseQuery(
    billingControllerCreateOptions({
      body: {
        amount: amount,
        billingId: billingId,
      },
    }),
  )

  const paymentIntentData = data?.data

  return children({
    data: paymentIntentData,
    isPending: isPending,
    isFetching: isFetching,
  })
}

export default function EwalletModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  amount: number
  billingId: string
  handleProceed: (selectedWallet: string | null) => void
}>) {
  const { handleProceed, billingId, amount } = innerProps

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  useEffect(() => {
    context.updateModal({
      modalId: id,
      centered: true,
    })
  }, [])

  return (
    <Stack gap="md">
      {ewallets.map((wallet) => (
        <Card
          key={wallet.value}
          // shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          onClick={() => setSelectedWallet(wallet.value)}
          style={{
            cursor: 'pointer',
            backgroundColor:
              selectedWallet === wallet.value
                ? 'var(--mantine-color-gray-0)'
                : undefined,
          }}
        >
          <Group>
            <Image
              src={wallet.logo}
              alt={wallet.value}
              h={rem(40)}
              w={rem(40)}
              fit="contain"
            />
            <Text fw={500} c={'gray.9'}>
              {wallet.name}
            </Text>
            <Transition
              mounted={selectedWallet === wallet.value}
              transition={'fade'}
              duration={250}
              timingFunction="ease"
            >
              {(styles) => (
                <IconCheck
                  style={{
                    ...styles,
                    marginLeft: 'auto',
                  }}
                  color="green"
                />
              )}
            </Transition>
          </Group>
        </Card>
      ))}

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={() => context.closeContextModal}>
          Cancel
        </Button>
        <Suspense
          fallback={
            <>
              <LoadingOverlay
                visible
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 2 }}
                loaderProps={{ color: 'primary' }}
              />
              <Button disabled>Proceed</Button>
            </>
          }
        >
          <EwalletModalQueryProvider
            props={{
              amount,
              billingId,
            }}
          >
            {(props) => (
              <Button
                loading={props.isFetching}
                disabled={!selectedWallet}
                onClick={() => handleProceed(selectedWallet)}
              >
                Proceed
              </Button>
            )}
          </EwalletModalQueryProvider>
        </Suspense>
      </Group>
    </Stack>
  )
}

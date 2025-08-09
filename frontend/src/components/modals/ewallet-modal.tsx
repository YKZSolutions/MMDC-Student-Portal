import type {
  IPaymentAttach,
  IPaymentIntentResponse,
  IPaymentMethod,
  IPaymentMethodResponse,
  PaymentMethod,
} from '@/features/billing/types'
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
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
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
}>) {
  const { billingId, amount } = innerProps

  const [selectedWallet, setSelectedWallet] = useState<PaymentMethod | null>(
    null,
  )

  useEffect(() => {
    context.updateModal({
      modalId: id,
      centered: true,
    })
  }, [])

  // Payment Method Creation
  const {
    mutate: mutateMethod,
    data: dataMethod,
    isPending: isMethodPending,
    mutateAsync: mutateMethodAsync,
  } = useMutation({
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
                type: payload.type,
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

      return await response.json()
    },
  })

  const {
    mutate: mutateAttach,
    data: dataAttach,
    isPending: isAttachPending,
    mutateAsync: mutateAttachAsync,
  } = useMutation({
    mutationFn: async (payload: IPaymentAttach | undefined) => {
      const response = await fetch(
        `https://api.paymongo.com/v1/payment_intents/${payload?.paymentIntentId}/attach`,
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
                client_key: payload?.clientKey,
                payment_method: payload?.paymentMethodId,
                return_url: `${import.meta.env.VITE_SITE_URL}/success`,
              },
            },
          }),
        },
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(JSON.stringify(error))
      }

      return await response.json()
    },
  })

  console.log(dataMethod, dataAttach)

  const handleProceed = async (
    selectedWallet: PaymentMethod | null,
    dataIntent: PaymentIntentDataDto | undefined,
  ) => {
    try {
      const attachResult = (await (async () => {
        const methodResult = await mutateMethodAsync({
          type: selectedWallet || 'gcash',
        })

        return await mutateAttachAsync({
          paymentIntentId: dataIntent?.id,
          paymentMethodId: methodResult.data.id,
          clientKey: dataIntent?.attributes.client_key,
        })
      })()) as IPaymentIntentResponse

      const redirectUrl =
        attachResult.data.attributes.next_action?.redirect?.url

      if (redirectUrl) window.open(redirectUrl, '_blank')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Stack gap="md">
      {ewallets.map((wallet) => (
        <Card
          key={wallet.value}
          // shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          onClick={() => setSelectedWallet(wallet.value as PaymentMethod)}
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
                loading={props.isFetching || isMethodPending || isAttachPending}
                disabled={!selectedWallet || isMethodPending || isAttachPending}
                onClick={() => handleProceed(selectedWallet, props.data)}
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

import {
  Button,
  Container,
  Loader,
  rem,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { readLocalStorageValue } from '@mantine/hooks'
import {
  IconArrowLeft,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconHelp,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Suspense } from 'react'

const route = getRouteApi('/(protected)/billing/redirect')

interface IPaymongoRedirectFetchResponse {
  data: {
    attributes: {
      status: string
    }
  }
}

async function paymongoRedirectFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${import.meta.env.VITE_PAYMONGO_PUBLIC_KEY}:`)}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(JSON.stringify(error))
  }

  return await response.json()
}

function RedirectQueryProvider({
  children,
}: {
  children: (props: {
    message: string
    isFetching: boolean
    isPending: boolean
  }) => ReactNode
}) {
  const searchParam: {
    payment_intent_id: string
  } = route.useSearch()

  const pmClientKey = readLocalStorageValue({ key: 'pm-client-key' })

  // Payment Intent Creation
  const { data, isFetching, isPending } = useSuspenseQuery({
    queryFn: () =>
      paymongoRedirectFetch<IPaymongoRedirectFetchResponse>(
        `https://api.paymongo.com/v1/payment_intents/${searchParam.payment_intent_id}?client_key=${pmClientKey}`,
      ),
    queryKey: ['attachPayment', searchParam.payment_intent_id],
  })

  const paymentStatus = data.data.attributes.status

  return children({
    message: paymentStatus,
    isPending: isPending,
    isFetching: isFetching,
  })
}

function RedirectPage() {
  const navigate = useNavigate()

  const handleStatusMessage = (
    paymentStatus: string,
    type: 'title' | 'subtitle',
  ): string => {
    const isTitle = type === 'title'

    switch (paymentStatus) {
      case 'succeeded':
        return isTitle
          ? 'Payment Successful!'
          : 'Your payment has been processed successfully.'

      case 'awaiting_payment_method':
        return isTitle
          ? 'Payment Failed!'
          : 'Please try again with a different payment method.'

      case 'processing':
        return isTitle
          ? 'Processing Payment'
          : 'We are currently processing your payment. Please wait.'

      default:
        return isTitle
          ? 'Unknown Payment Status'
          : 'We could not determine the payment status at this time.'
    }
  }

  const handleStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'succeeded':
        return <IconCircleCheck size={80} color="green" stroke={1.5} />
      case 'awaiting_payment_method':
        return <IconCircleX size={80} color="red" stroke={1.5} />
      case 'processing':
        return <IconClock size={80} color="orange" stroke={1.5} />
      default:
        return <IconHelp size={80} color="gray" stroke={1.5} />
    }
  }

  return (
    <Container size="sm" className="my-auto pb-40">
      <Stack align="center" gap="md">
        <Suspense fallback={<Loader />}>
          <RedirectQueryProvider>
            {(props) => (
              <>
                {handleStatusIcon(props.message)}
                <Stack align="center" gap={rem(5)}>
                  <Title order={2}>
                    {handleStatusMessage(props.message, 'title')}
                  </Title>
                  <Text size="md" c={'dimmed'}>
                    {handleStatusMessage(props.message, 'subtitle')}
                  </Text>
                </Stack>
                <Button
                  size="md"
                  variant="subtle"
                  leftSection={<IconArrowLeft />}
                  onClick={() => navigate({ to: '/billing', replace: true })}
                >
                  Go back to Billing Page
                </Button>
              </>
            )}
          </RedirectQueryProvider>
        </Suspense>
      </Stack>
    </Container>
  )
}

export default RedirectPage

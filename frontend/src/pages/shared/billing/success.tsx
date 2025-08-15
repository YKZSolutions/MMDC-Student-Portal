import { Button, Container, rem, Stack, Text, Title } from '@mantine/core'
import { IconCircleCheck } from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/billing/success')

function SuccessPage() {
  const navigate = useNavigate()
  return (
    <Container size="sm" className="my-auto pb-40">
      <Stack align="center" gap="md">
        <IconCircleCheck size={80} color="green" stroke={1.5} />

        <Stack align="center" gap={rem(5)}>
          <Title order={2}>Payment Successful!</Title>
          <Text size="md" c={'dimmed'}>
            Your payment has been processed successfully.
          </Text>
        </Stack>
        <Button
          size="md"
          variant="filled"
          onClick={() => navigate({ to: '/billing', replace: true })}
        >
          Go back to Billing Page
        </Button>
      </Stack>
    </Container>
  )
}

export default SuccessPage

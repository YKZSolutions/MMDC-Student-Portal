import GridBackground from '@/components/grid-background'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { emailValidator } from '@/features/validation/custom-validaitons.ts'
import {
  Anchor,
  Button,
  Card,
  Container,
  Group,
  Paper,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconArrowLeft } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { useState } from 'react'

const ResetPasswordPage = () => {
  const { requestPasswordReset } = useAuth()
  const [isSuccess, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
    },
    validate: zod4Resolver(emailValidator),
  })

  const handleSubmit = async (values: typeof form.values) => {
    const { error } = await requestPasswordReset(values.email)

    if (error) {
      setError(error.message)
      return
    }

    setError(null)
    setSuccess(true)
  }

  return (
    <Container
      fluid
      className="min-h-screen grid place-items-center relative"
      px={0}
    >
      <GridBackground />
      <Card
        withBorder
        radius="md"
        shadow="sm"
        p="xl"
        w={`min(${rem(500)}, 95vw)`}
      >
        <Stack gap="lg">
          {/* Header */}
          <Stack gap={4}>
            <Title order={3} ta="center">
              Forgot your password?
            </Title>
            <Text c="dimmed" size="sm" ta="center">
              Enter your email address and we'll send you instructions to reset
              it.
            </Text>
          </Stack>

          {/* Form */}
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="sm">
              <TextInput
                label="Email address"
                placeholder="you@example.com"
                disabled={form.submitting}
                data-cy="email-input"
                radius="md"
                withAsterisk
                {...form.getInputProps('email')}
              />

              {/* feedback */}
              {error && (
                <Text size="sm" c="red">
                  {error}
                </Text>
              )}
              {isSuccess && (
                <Paper
                  withBorder
                  radius="md"
                  p="sm"
                  style={{ background: 'rgba(16,185,129,0.08)' }}
                >
                  <Text c="teal" size="sm">
                    Password reset link sent to <b>{form.values.email}</b>
                  </Text>
                </Paper>
              )}

              <Button
                type="submit"
                loading={form.submitting}
                data-cy="send-button"
                radius="md"
                fullWidth
                variant="gradient"
                gradient={{
                  from: 'blue.3',
                  to: 'blue.7',
                  deg: 45,
                }}
              >
                Send reset link
              </Button>

              <Text c="dimmed" size="xs" ta="center">
                Check your spam folder if you don’t see the email.
              </Text>
            </Stack>
          </form>

          {/* Back link */}

          <Anchor
            size="sm"
            ml={'auto'}
            onClick={() =>
              navigate({
                to: '/login',
              })
            }
            style={{ cursor: 'pointer', textAlign: 'center' }}
            c={'blue.7'}
          >
            <Group gap={rem(5)}>
              <IconArrowLeft size={13} />
              Back to login
            </Group>
          </Anchor>
        </Stack>
      </Card>
    </Container>
  )
}

export default ResetPasswordPage

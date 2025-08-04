import { useAuth } from '@/features/auth/auth.hook'
import { zUserCredentialsDto } from '@/integrations/api/client/zod.gen'
import { Button, Card, Checkbox, Container, Group, Stack, TextInput, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { getRouteApi, Link } from '@tanstack/react-router'
import { zod4Resolver } from 'mantine-form-zod-resolver'

const route = getRouteApi('/(auth)/login')

function LoginPage() {
  const { login } = useAuth()
  const navigate = route.useNavigate()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: zod4Resolver(zUserCredentialsDto),
  })

  const handleSubmit = async (values: typeof form.values) => {
    const response = await login(values.email, values.password)

    if (response.error) {
      form.setErrors({
        email: 'Invalid Email',
        password: 'Invalid Password',
      })
      return
    }

    await navigate({
      to: '/dashboard',
    })
  }

  return (
    <Container className="h-screen grid place-content-center">
      <Card withBorder className="w-screen max-w-sm">
        <Title order={2} className="text-center pb-5">
          Login
        </Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="john@email.com"
              disabled={form.submitting}
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Password"
              placeholder="Type your password here..."
              type="password"
              disabled={form.submitting}
              {...form.getInputProps('password')}
            />
            <Group justify="space-between" className="text-sm">
              <Checkbox label="Remember me" disabled={form.submitting} />
              <Link
                to="/reset-password"
                className="underline decoration-dotted text-blue-950 hover:text-blue-600"
              >
                Forgot Password?
              </Link>
            </Group>
            <Button type="submit" loading={form.submitting}>
              Login
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  )
}

export default LoginPage

import GridBackground from '@/components/grid-background'
import { useAuth } from '@/features/auth/auth.hook'
import { zUserCredentialsDto } from '@/integrations/api/client/zod.gen'
import {
  AspectRatio,
  Button,
  Card,
  Container,
  Image,
  PasswordInput,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
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
    <Container
      fluid
      className="min-h-screen grid place-items-center relative"
      px={0}
      style={{
        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)', // subtle background
      }}
    >
      <GridBackground />
      <Card
        radius="lg"
        p="xl"
        w={`min(${rem(480)}, 94vw)`}
        className="ring-1 ring-gray-300 shadow-xl shadow-dark-900"
      >
        <Stack align="center" mb="lg" gap="xs">
          <AspectRatio ratio={1} style={{ width: 72 }}>
            <Image
              src="/mmdc-logo.jpg"
              alt="MMDC"
              fit="contain"
              style={{ borderRadius: '12px' }}
            />
          </AspectRatio>

          <Title order={3} ta="center" fw={700}>
            Welcome back
          </Title>
          <Text c="dimmed" size="sm" ta="center" style={{ maxWidth: rem(420) }}>
            Sign in to continue to the <strong>MMDC Student Portal</strong>
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              disabled={form.submitting}
              data-cy="email-input"
              radius="md"
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              disabled={form.submitting}
              data-cy="password-input"
              radius="md"
              {...form.getInputProps('password')}
            />

            <Link
              to="/reset-password"
              className="text-blue-600 hover:text-blue-900 hover:underline underline-offset-2 font-medium text-sm ml-auto"
              data-cy="forgot-password-link"
            >
              Forgot password?
            </Link>

            <Button
              type="submit"
              loading={form.submitting}
              data-cy="login-button"
              radius="xl"
              fullWidth
              gradient={{ from: 'blue.4', to: 'blue.7', deg: 45 }}
              variant="gradient"
              className="hover:scale-102 transition-transform duration-200"
            >
              Log In
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  )
}

export default LoginPage

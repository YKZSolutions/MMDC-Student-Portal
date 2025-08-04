import { Button, Card, Container, Stack, TextInput, Title } from '@mantine/core'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { useState } from 'react'
import { useForm } from '@mantine/form'
import { zod4Resolver } from 'mantine-form-zod-resolver'
import { zUserCredentialsDto } from '@/integrations/api/client/zod.gen.ts'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(auth)/update-password')

const UpdatePasswordPage = () => {
  const { updateUserPassword } = useAuth()
  const [isSuccess, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = route.useNavigate()

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      password: ''
    },
    validate: zod4Resolver(zUserCredentialsDto),
  })

  const handleSubmit = async (values: typeof form.values) => {
    const response = await updateUserPassword(values.password)

    if (response.error) {
      setError(response.error.message)
      return
    }

    setError(null)
    setSuccess(true)

    await navigate({
      to: '/login',
    })
  }

  return (
    <Container className="h-screen grid place-content-center">
      <Card withBorder className="w-screen max-w-md">
        <Title order={2} className="text-center pb-5">
          Update your password
        </Title>
        <p className="text-center text-sm pb-5">
          Enter new password
        </p>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Password"
              type="password"
              disabled={form.submitting}
              {...form.getInputProps('password')}
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {isSuccess && (
              <p className="text-green-500 text-sm">
                Password has been updated, you can now log in.
              </p>
            )}
            <Button type="submit" loading={form.submitting}>
              Update
            </Button>
          </Stack>
        </form>
      </Card>
    </Container>
  )
}
export default UpdatePasswordPage

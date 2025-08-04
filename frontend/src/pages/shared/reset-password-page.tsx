import {useAuth} from "@/features/auth/auth.hook.ts";
import {useForm} from "@mantine/form";
import {zod4Resolver} from "mantine-form-zod-resolver";
import { zUserCredentialsDto } from '@/integrations/api/client/zod.gen.ts'
import { Button, Card, Container, Stack, TextInput, Title } from '@mantine/core'
import { useState } from 'react'

const ResetPasswordPage = () => {
    const { requestPasswordReset } = useAuth()
    const [isSuccess, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            email: ''
        },
        validate: zod4Resolver(zUserCredentialsDto),
    })

    const handleSubmit = async (values: typeof form.values) => {
      const response = await requestPasswordReset(values.email)

        if (response.error) {
          setError(response.error.message)
          return
        }

      setError(null)
      setSuccess(true)
    }

    return (
      <Container className="h-screen grid place-content-center">
        <Card withBorder className="w-screen max-w-md">
          <Title order={2} className="text-center pb-5">
            Reset Password
          </Title>
          <p className="text-center text-sm pb-5">
            Enter your registered email address.
          </p>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="john@email.com"
                disabled={form.submitting}
                {...form.getInputProps('email')}
              />
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              {isSuccess && (
                <p className="text-green-500 text-sm">
                  The password reset link has been sent to {form.values.email}
                </p>
              )}
              <Button type="submit" loading={form.submitting}>
                Send
              </Button>
            </Stack>
          </form>
        </Card>
      </Container>
    )
}
export default ResetPasswordPage

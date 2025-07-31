import { useAuth } from '@/features/auth/auth.hook'
import { testControllerTestStudentOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { supabase } from '@/integrations/supabase/supabase-client'
import { Button, Card, Container, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'

function LoginPage() {
  const { login } = useAuth()

  const onLoginClick = async () => {
    const user = login('test@email.com', '1234')
    console.log(user)
  }

  const onJWTClick = async () => {
    const user = await supabase.auth.getClaims()
    const session = await supabase.auth.getSession()

    console.log(user, session)
  }

  const { data, error } = useQuery(testControllerTestStudentOptions())

  console.log(data, error?.message)

  return (
    <Container>
      <Card>
        <form>
          <TextInput />
          <TextInput />
          <Button onClick={onLoginClick}>Login</Button>
          <Button onClick={onJWTClick}>JWT</Button>
        </form>
      </Card>
    </Container>
  )
}

export default LoginPage

import { useAuth } from '@/features/auth/auth.hook'
import { testControllerTestStudentOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { Card, Container } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'

function StudentDashboard() {
  const { authUser } = useAuth('protected')

  const student = useQuery(testControllerTestStudentOptions())
  console.log(student.data, student.error?.message)

  return (
    <Container>
      <Card>Woggy {student.data}</Card>
    </Container>
  )
}

export default StudentDashboard

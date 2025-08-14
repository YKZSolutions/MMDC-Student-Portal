import { Box, Container, Stack, Text, Title } from '@mantine/core'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/enrollment/')

function EnrollmentAdminPage() {
  return (
    <Container size={'md'} w={'100%'} pb={'xl'}>
      <Stack gap={'xl'}>
        {/* Page Hero */}
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            Enrollment
          </Title>
          <Text c={'dark.3'} fw={500}>
            Manage student enrollment and course selection.
          </Text>
        </Box>

        {/* Table */}
      </Stack>
    </Container>
  )
}

export default EnrollmentAdminPage

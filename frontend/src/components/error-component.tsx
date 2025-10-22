import type { ApiErrorResponse } from '@/features/validation/api-error.schema'
import {
  Box,
  Button,
  Center,
  Code,
  Collapse,
  Container,
  Paper,
  rem,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react'

function ErrorFallback<TError extends ApiErrorResponse>({
  error,
}: {
  error?: TError
}) {
  const [opened, { toggle }] = useDisclosure(false)

  if (!error) {
    return (
      <Center my={'auto'}>
        <Container size="sm">
          <Stack align="center" gap="lg">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="light"
              color="red"
              style={{
                boxShadow: '0 4px 20px rgba(250, 82, 82, 0.15)',
              }}
            >
              <IconAlertTriangle size={48} stroke={1.5} />
            </ThemeIcon>

            <Stack align="center" gap={rem(5)}>
              <Text fw={700} size="xl" c="dark.7">
                Something Went Wrong
              </Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                We encountered an unexpected error. Please try again later or
                contact support if the problem persists.
              </Text>
            </Stack>
          </Stack>
        </Container>
      </Center>
    )
  }

  return (
    <Center my={'auto'}>
      <Container size="sm">
        <Stack align="center" gap="lg">
          <ThemeIcon
            size={80}
            radius="xl"
            variant="light"
            color="red"
            style={{
              boxShadow: '0 4px 20px rgba(250, 82, 82, 0.15)',
            }}
          >
            <IconAlertTriangle size={48} stroke={1.5} />
          </ThemeIcon>

          <Stack align="center" gap={rem(5)} w="100%">
            <Text fw={700} size="xl" c="dark.7">
              {error.error || 'An unexpected error has occurred'}
            </Text>

            <Text size="sm" c="dimmed" ta="center" maw={400}>
              Please try again later or contact support if the problem persists.
            </Text>
          </Stack>

          <Box w="100%">
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={toggle}
              rightSection={
                opened ? (
                  <IconChevronUp size={14} />
                ) : (
                  <IconChevronDown size={14} />
                )
              }
              fullWidth
            >
              {opened ? 'Hide' : 'Show'} Technical Details
            </Button>

            <Collapse in={opened}>
              <Paper
                mt="sm"
                p="md"
                radius="md"
                withBorder
                bg="gray.0"
                style={{
                  borderColor: 'var(--mantine-color-gray-3)',
                }}
              >
                <Stack gap="xs">
                  {error.requestId && (
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        Request ID
                      </Text>
                      <Code block mt={4}>
                        {error.requestId}
                      </Code>
                    </Box>
                  )}
                  {error.timestamp && (
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        Timestamp
                      </Text>
                      <Code block mt={4}>
                        {new Date(error.timestamp).toLocaleString()}
                      </Code>
                    </Box>
                  )}
                  {error.path && (
                    <Box>
                      <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                        Path
                      </Text>
                      <Code block mt={4}>
                        {error.path}
                      </Code>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Collapse>
          </Box>
        </Stack>
      </Container>
    </Center>
  )
}

export default ErrorFallback

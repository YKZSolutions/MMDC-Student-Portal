import {
  Button,
  Group,
  Stack,
  Text,
  rem
} from '@mantine/core'
import type { ContextModalProps } from '@mantine/modals'
import { useEffect } from 'react'

export default function EnrollmentCourseCreateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{}>) {
  useEffect(() => {
    context.updateModal({
      modalId: id,
      centered: true,
      radius: 'md',
      withCloseButton: false,
    })
  }, [])
  return (
    <Stack gap="sm">
      <Stack gap={rem(2.5)}>
        <Text fw={500} c={'dark.9'}>
          Select E-wallet
        </Text>
        <Text fz="sm" c="dark.3" mb="sm">
          Choose how you want to make payments
        </Text>
      </Stack>

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={() => context.closeContextModal(id)}>
          Cancel
        </Button>
      </Group>
    </Stack>
  )
}

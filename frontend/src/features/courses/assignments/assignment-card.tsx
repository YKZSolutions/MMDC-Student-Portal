import {
  Badge,
  Card,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconClock } from '@tabler/icons-react'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import SubmitButton from '@/components/submit-button.tsx'
import type { StudentAssignment } from '@/features/courses/assignments/types.ts'

const AssignmentCard = ({ assignment }: { assignment: StudentAssignment }) => {
  const theme = useMantineTheme();

  return (
    <Card withBorder radius="md" p="lg" shadow="xs">
      <Group justify="space-between" align="stretch">
        {/* Left Section: Title, Description, and Status */}
        <Stack flex={1} justify="space-between" gap="xs">
          <Group>
            <Title order={4} fw={600}>
              {assignment.title}
            </Title>
            <Badge
              color={assignment.submissionStatus}
              variant="outline"
              size="md"
            >
              {assignment.submissionStatus}
            </Badge>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <IconClock size={16} color={theme.colors.gray[6]} />
            <Text size="sm" c="dimmed">
              Due: {formatTimestampToDateTimeText(assignment.dueDate, 'by')}
            </Text>
            {assignment.submissionTimestamp && (
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" c="dimmed">
                  |
                </Text>
                <Text size="sm" c="dimmed">
                  Submitted: {formatTimestampToDateTimeText(assignment.dueDate)}
                </Text>
              </Group>
            )}
          </Group>
        </Stack>

        {/* Right Section: Action Button */}
        <Stack align="flex-end" justify="center" flex={1}>
          <SubmitButton
            submissionStatus={assignment.submissionStatus}
            onClick={() => {}}
            dueDate={assignment.dueDate}
            assignmentStatus={assignment.status}
          />
        </Stack>
      </Group>
    </Card>
  )
}

export default AssignmentCard
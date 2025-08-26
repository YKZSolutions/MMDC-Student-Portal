import { Badge, rem, Text } from '@mantine/core';
import type { EnrollmentStatus } from '../validation/create-enrollment';

const STATUS_STYLES: Record<
  EnrollmentStatus,
  { color: string; label: string }
> = {
  draft: { color: 'gray', label: 'Draft' },
  upcoming: { color: 'indigo', label: 'Upcoming' },
  active: { color: 'green.9', label: 'Active' },
  extended: { color: 'blue', label: 'Extended' },
  closed: { color: 'orange', label: 'Closed' },
  canceled: { color: 'red', label: 'Canceled' },
  archived: { color: 'dark', label: 'Archived' },
}

function EnrollmentBadgeStatus({ status }: { status: EnrollmentStatus }) {
  const { color, label } = STATUS_STYLES[status]

  return (
    <Badge color={color} radius="xl" size="md" variant="dot">
      <Text fz={rem(10)} fw={600}>
        {label}
      </Text>
    </Badge>
  )
}

export default EnrollmentBadgeStatus

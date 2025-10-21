import { Box, rem, Skeleton, Stack } from '@mantine/core'

export function SuspendedTranscriptEditForm() {
  return (
    <Stack gap="md">
      {/* Course Info Skeleton */}
      <Box>
        <Skeleton height={rem(20)} width="70%" mb="xs" />
        <Skeleton height={rem(14)} width="50%" />
      </Box>

      {/* Form Fields Skeleton */}
      <Stack gap="md">
        {/* Grade (Numeric) Select */}
        <Box>
          <Skeleton height={rem(14)} width={rem(100)} mb="xs" />
          <Skeleton height={rem(36)} radius="md" />
        </Box>

        {/* Grade (Letter) Select */}
        <Box>
          <Skeleton height={rem(14)} width={rem(120)} mb="xs" />
          <Skeleton height={rem(36)} radius="md" />
        </Box>

        {/* Action Buttons */}
        <Stack gap="xs" align="flex-end">
          <Skeleton height={rem(36)} width={rem(180)} radius="md" />
        </Stack>
      </Stack>
    </Stack>
  )
}

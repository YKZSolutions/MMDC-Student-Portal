import { Group, Skeleton, rem } from '@mantine/core'

export function SuspendedPagination() {
  return (
    <Group justify="flex-end">
      <Skeleton visible height={rem(30)} width={rem('20%')} />
      <Skeleton visible height={rem(30)} width={rem('10%')} />
    </Group>
  )
}

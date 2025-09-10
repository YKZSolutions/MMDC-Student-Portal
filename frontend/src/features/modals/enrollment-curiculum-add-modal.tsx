import type { CourseDto } from '@/integrations/api/client'
import {
  coursesControllerFindAllOptions,
  curriculumControllerFindAllOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  rem,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import type { ContextModalProps } from '@mantine/modals'
import { IconBox, IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

// interface IEnrollmentCourseCreateModalQuery {
//   page: number
//   search?: string
// }

export default function EnrollmentCurriculumAddModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onSelect?: (id: string) => void
}>) {
  useEffect(() => {
    context.updateModal({
      modalId: id,
      centered: true,
      radius: 'md',
      size: 'lg',
      lockScroll: true,
      withCloseButton: false,
    })
  }, [])

  const handleSelect = (id: string) => {
    innerProps?.onSelect?.(id)
    context.closeContextModal(id)
  }

  return (
    <Stack gap="sm" p="md">
      <Stack gap={rem(6)}>
        <Text fw={700} c="dark.9">
          Add Course to Enrollment Period
        </Text>
        <Text fz="sm" c="dark.3">
          Search and pick a course to add to the current enrollment period.
        </Text>
      </Stack>

      <TextInput
        placeholder="Search courses by name, code, or description..."
        leftSection={
          <ActionIcon variant="transparent" size="sm">
            <IconSearch size={16} />
          </ActionIcon>
        }
      />
      <Suspense fallback={'Loading...'}>
        <CurriculumList onSelect={(id) => handleSelect(id)} />
      </Suspense>
    </Stack>
  )
}

function CurriculumList({ onSelect }: { onSelect: (id: string) => void }) {
  const { data: curriculums } = useSuspenseQuery(
    curriculumControllerFindAllOptions(),
  )

  const handleSelect = (id: string) => {}

  return (
    <Stack>
      {curriculums.map((curriculum) => (
        <Card
          key={curriculum.id}
          withBorder
          radius="md"
          p="sm"
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(curriculum.id)}
        >
          <Group justify="space-between">
            <Group>
              <IconBox />
              <Stack gap={0}>
                <Text fw={500}>{curriculum.major.name}</Text>
                <Text size="sm">{curriculum.program.name}</Text>
              </Stack>
            </Group>

            <Badge color="gray" variant="light">
              {10} Courses
            </Badge>
          </Group>
        </Card>
      ))}
    </Stack>
  )
}

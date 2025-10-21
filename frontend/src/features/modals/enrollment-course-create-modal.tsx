// ...existing code...
import type { CourseFullDto } from '@/integrations/api/client'
import { coursesControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
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
import { IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Suspense, useEffect, useState, type ReactNode } from 'react'

const route = getRouteApi('/(protected)/enrollment/$periodId')

interface IEnrollmentCourseCreateModalQuery {
  page: number
  search?: string
}

function EnrollmentCourseCreateModalQueryProvider({
  children,
  props,
}: {
  children: (props: {
    courses: CourseFullDto[]
    isFetching: boolean
    isPending: boolean
  }) => ReactNode
  props: IEnrollmentCourseCreateModalQuery
}) {
  const { page, search } = props

  // Payment Intent Creation
  const { data, isFetching, isPending, isError } = useSuspenseQuery({
    ...coursesControllerFindAllOptions({
      query: {
        page: page ?? 1,
        search: search || undefined,
      },
    }),
  })

  const courses = data?.courses ?? []

  return children({
    courses,
    isPending: isPending,
    isFetching: isFetching,
  })
}

export default function EnrollmentCourseCreateModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  onSelect?: (course: CourseFullDto) => void
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

  const isMobile = useMediaQuery('(max-width: 768px)')

  const queryDefaultValues = {
    search: '',
    page: 1,
  }

  const [query, setQuery] =
    useState<IEnrollmentCourseCreateModalQuery>(queryDefaultValues)

  // debounce the search so the query provider isn't called on every keystroke
  const [debouncedSearch] = useDebouncedValue(query.search, 300)

  const debouncedQuery = {
    search: debouncedSearch,
    page: query.page,
  } as IEnrollmentCourseCreateModalQuery

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }))
  }

  const handlePage = (page: IEnrollmentCourseCreateModalQuery['page']) => {
    setQuery((prev) => ({
      ...prev,
      page,
    }))
  }

  const handleSelect = (course: CourseFullDto) => {
    // call callback if provided
    innerProps?.onSelect?.(course)
    // close modal
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
        value={query.search}
        onChange={handleSearch}
      />

      <Suspense
        fallback={
          <Stack>
            {[1, 2, 3, 4].map((n) => (
              <Skeleton key={n} height={rem(60)} radius="md" />
            ))}
          </Stack>
        }
      >
        <EnrollmentCourseCreateModalQueryProvider props={debouncedQuery}>
          {({ courses, isFetching, isPending }) => (
            <>
              <ScrollArea.Autosize
                scrollbars="y"
                type="always"
                h={isMobile ? rem(300) : rem(350)}
                mah={isMobile ? rem(300) : rem(350)}
              >
                {isFetching && !courses.length ? (
                  <Stack>
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} height={72} radius="md" />
                    ))}
                  </Stack>
                ) : courses.length === 0 ? (
                  <Center style={{ height: rem(240) }}>
                    <Stack align="center">
                      <Text c="dimmed">No courses found</Text>
                      <Text fz="sm" c="dimmed">
                        Try a different search or clear filters.
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  <SimpleGrid cols={1} spacing="sm" py={'xs'}>
                    {courses.map((course) => (
                      <Card
                        key={course.id}
                        withBorder
                        radius="md"
                        p="sm"
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSelect(course)}
                      >
                        <Group
                          justify="space-between"
                          align="flex-start"
                          wrap="nowrap"
                        >
                          <Group gap="sm" align="flex-start">
                            <Avatar color="blue" radius="sm">
                              {(course.name?.[0] ?? 'C').toUpperCase()}
                            </Avatar>
                            <Stack gap={rem(5)}>
                              <Box>
                                <Text fw={600} fz="sm">
                                  {course.name ?? 'Untitled'}
                                </Text>

                                <Group gap={rem(3)}>
                                  <Text fz="xs" c="dimmed">
                                    {course.courseCode}
                                  </Text>
                                  <Text fz="xs" c="dimmed">
                                    •
                                  </Text>
                                  <Text fz="xs" c="dimmed">
                                    {`${course.prereqs.length} prerequisites`}
                                  </Text>
                                  <Text fz="xs" c="dimmed">
                                    •
                                  </Text>
                                  <Text fz="xs" c="dimmed">
                                    {`${course.coreqs.length} corequisites`}
                                  </Text>
                                </Group>
                              </Box>
                              {/* <Group gap={rem(5)} wrap="wrap">
                                <Badge
                                  size="sm"
                                  variant="default"
                                  c="dark.3"
                                  radius="xl"
                                >
                                  {formatOrdinal(Number(course.year))} year
                                </Badge>
                                <Badge
                                  size="sm"
                                  variant="default"
                                  c="dark.3"
                                  radius="xl"
                                >
                                  {formatOrdinal(Number(course.semester))}{' '}
                                  semester
                                </Badge>
                              </Group> */}
                            </Stack>
                          </Group>

                          <Badge color="gray" variant="light">
                            {course.units} Unit{course.units > 1 ? 's' : ''}
                          </Badge>
                        </Group>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </ScrollArea.Autosize>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="subtle"
                  onClick={() => context.closeContextModal(id)}
                >
                  Cancel
                </Button>
              </Group>
            </>
          )}
        </EnrollmentCourseCreateModalQueryProvider>
      </Suspense>
    </Stack>
  )
}

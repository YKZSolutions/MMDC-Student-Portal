import PaginatedTable from '@/components/paginated-table'
import { usePaginationSearch } from '@/features/pagination/usePaginationSearch'
import { coursesControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import {
  Box,
  Button,
  Container,
  Group,
  rem,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { IconFilter2, IconPlus, IconSearch } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/curriculum/courses/')

export default function CurriculumCourses() {
  return (
    <Container fluid w="100%" flex={1} m={0} pb="xl" className="flex flex-col">
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Courses
        </Title>
        <Text c={'dark.3'} fw={500}>
          View and manage all courses
        </Text>
      </Box>

      <Stack gap={'md'} flex={1}>
        <Group gap={rem(5)} justify="end" align="center">
          <TextInput
            placeholder="Search year/term/date"
            radius={'md'}
            leftSection={<IconSearch size={18} stroke={1} />}
            w={rem(250)}
          />
          <Button
            variant="default"
            radius={'md'}
            leftSection={<IconFilter2 color="gray" size={20} />}
            lts={rem(0.25)}
          >
            Filters
          </Button>
          <Button
            component={Link}
            to="/curriculum/courses/create"
            variant="filled"
            radius={'md'}
            leftSection={<IconPlus size={20} />}
            lts={rem(0.25)}
          >
            Create
          </Button>
        </Group>

        <EnrollmentTable />
      </Stack>
    </Container>
  )
}

interface Courses {
  id: string
  code: string
  name: string
  description?: string
  prereq?: {
    name: string
    code: string
  }
  coreq?: {
    name: string
    code: string
  }
  type: 'Core' | 'Elective' | 'General' | 'Major' | 'Specialization'
  department: 'GE' | 'IT' | 'BA'
  units: number
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

function EnrollmentTable() {
  const { pagination, changePage } = usePaginationSearch(route)

  const { data: paginated } = useSuspenseQuery(
    coursesControllerFindAllOptions({ query: { ...pagination } }),
  )

  const courses = paginated.courses
  const meta = paginated.meta

  return (
    <PaginatedTable
      fullHeight
      data={courses}
      meta={meta}
      currentPage={pagination.page}
      onPaginationChange={(val) => changePage(val, meta.pageCount)}
      heading={['Code', 'Name', 'Units', 'Prerequisites', 'Corequisites']}
      rowComponent={(course) => (
        <>
          <Table.Td>
            <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
              {course.courseCode}
            </Text>
          </Table.Td>

          <Table.Td>
            <Text size="sm" c={'dark.8'} fw={500} py={'xs'}>
              {course?.name}
            </Text>
          </Table.Td>

          {/* <Table.Td>
              <Badge radius="lg">
                <Text size="sm" className="capitalize" fw={500} py={'xs'}>
                  {course.department}
                </Text>
              </Badge>
            </Table.Td>

            <Table.Td>
              <Badge variant="light" radius="lg">
                <Text size="sm" className="capitalize" fw={500} py={'xs'}>
                  {course.type}
                </Text>
              </Badge>
            </Table.Td> */}

          <Table.Td>
            <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
              {course.units}
            </Text>
          </Table.Td>

          <Table.Td>
            <Stack gap={0} py={'xs'}>
              {course.prereqs.length > 0 ? (
                <>
                  <Text size="sm" c={'dark.3'} fw={500}>
                    {course.prereqs[0].name}
                  </Text>
                  <Text size="xs" c={'dark.1'} fw={500}>
                    {course.prereqs[0].courseCode}
                  </Text>
                </>
              ) : (
                <Text size="sm" c={'dark.3'} fw={500}>
                  N/A
                </Text>
              )}
            </Stack>
          </Table.Td>

          <Table.Td>
            <Stack gap={0} py={'xs'}>
              {course.coreqs.length > 0 ? (
                <>
                  <Text size="sm" c={'dark.3'} fw={500}>
                    {course.coreqs[0].name}
                  </Text>
                  <Text size="xs" c={'dark.1'} fw={500}>
                    {course.coreqs[0].courseCode}
                  </Text>
                </>
              ) : (
                <Text size="sm" c={'dark.3'} fw={500}>
                  N/A
                </Text>
              )}
            </Stack>
          </Table.Td>
        </>
      )}
    />
  )
}

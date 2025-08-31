import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Checkbox,
  Container,
  Group,
  Menu,
  rem,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import {
  IconDotsVertical,
  IconFilter2,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

export default function CurriculumCourses() {
  return (
    <Container fluid m={0}>
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Courses
        </Title>
        <Text c={'dark.3'} fw={500}>
          View and manage all courses
        </Text>
      </Box>

      <Stack gap={'md'}>
        <Group gap={rem(5)} justify="end" align="center">
          {/* Changed spacing to gap */}
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
            variant="filled"
            radius={'md'}
            leftSection={<IconPlus size={20} />}
            lts={rem(0.25)}
          >
            Create
          </Button>
        </Group>

        {/* Table */}
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

const mockCourses: Courses[] = [
  {
    id: 'course_1',
    code: 'MO-IT200D2',
    name: 'Capstone 2',
    prereq: {
      name: 'Capstone 1',
      code: 'MO-IT200D1',
    },
    type: 'Core',
    department: 'IT',
    units: 3,
    created_at: new Date('2023-12-01T10:00:00Z'),
    updated_at: new Date('2024-05-16T12:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'course_2',
    code: 'MO-IT200D2',
    name: 'Philippine Popular Culture',
    type: 'General',
    department: 'GE',
    units: 3,
    created_at: new Date('2023-12-01T10:00:00Z'),
    updated_at: new Date('2024-05-16T12:00:00Z'),
    deleted_at: null,
  },
  {
    id: 'course_3',
    code: 'MO-IT151',
    name: 'Platform Technologies',
    type: 'Major',
    department: 'IT',
    units: 3,
    created_at: new Date('2023-12-01T10:00:00Z'),
    updated_at: new Date('2024-05-16T12:00:00Z'),
    deleted_at: null,
  },
]

function EnrollmentTable() {
  return (
    <Table
      verticalSpacing={'md'}
      highlightOnHover
      highlightOnHoverColor="gray.0"
      style={{ borderRadius: rem('8px'), overflow: 'hidden' }}
      styles={{
        th: {
          fontWeight: 500,
        },
      }}
    >
      <Table.Thead>
        <Table.Tr
          style={{
            border: '0px',
          }}
          bg={'gray.1'}
          c={'dark.5'}
        >
          <Table.Th>
            <Checkbox size="sm" />
          </Table.Th>
          <Table.Th>Code</Table.Th>
          <Table.Th>Name</Table.Th>
          <Table.Th>Department</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Units</Table.Th>
          <Table.Th>Prerequisites</Table.Th>
          <Table.Th>Corequisites</Table.Th>
          <Table.Th></Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        style={{
          cursor: 'pointer',
        }}
      >
        {mockCourses.map((course) => (
          <Table.Tr>
            <Table.Td>
              <Checkbox size="sm" />
            </Table.Td>

            <Table.Td>
              <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
                {course.code}
              </Text>
            </Table.Td>

            <Table.Td>
              <Text size="sm" c={'dark.8'} fw={500} py={'xs'}>
                {course.name}
              </Text>
            </Table.Td>

            <Table.Td>
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
            </Table.Td>

            <Table.Td>
              <Text size="sm" c={'dark.3'} fw={500} py={'xs'}>
                {course.units}
              </Text>
            </Table.Td>

            <Table.Td>
              <Stack gap={0} py={'xs'}>
                <Text size="sm" c={'dark.3'} fw={500}>
                  {course.prereq?.name}
                </Text>
                <Text size="xs" c={'dark.1'} fw={500}>
                  {course.prereq?.code}
                </Text>
              </Stack>
            </Table.Td>

            <Table.Td>
              <Stack gap={0} py={'xs'}>
                <Text size="sm" c={'dark.3'} fw={500}>
                  {course.coreq?.name}
                </Text>
                <Text size="xs" c={'dark.1'} fw={500}>
                  {course.coreq?.code}
                </Text>
              </Stack>
            </Table.Td>

            <Table.Td>
              <Menu shadow="md" width={200}>
                <Menu.Target>
                  <ActionIcon
                    onClick={(e) => e.stopPropagation()}
                    variant="subtle"
                    color="gray"
                    radius={'xl'}
                  >
                    <IconDotsVertical size={20} stroke={1.5} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item>View Details</Menu.Item>
                  <Menu.Item>Edit</Menu.Item>
                  <Menu.Item c="red">Delete</Menu.Item>{' '}
                </Menu.Dropdown>
              </Menu>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

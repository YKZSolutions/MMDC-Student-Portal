import {
  Accordion,
  ActionIcon,
  Badge,
  Card,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconBook2,
  IconBookFilled,
  IconCode,
} from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'

export default function CurriculumView() {
  const router = useRouter()

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Group mb="lg">
        <ActionIcon
          variant="subtle"
          radius="lg"
          onClick={() => router.history.back()}
        >
          <IconArrowLeft />
        </ActionIcon>
        <Title order={3} fw={700}>
          Curriculum Details
        </Title>
      </Group>

      <Card
        mb="xl"
        px="xl"
        py="lg"
        radius="lg"
        c="white"
        shadow="sm"
        bg="linear-gradient(45deg, rgba(25,64,140,0.9) 0%, rgba(79,110,171,0.9) 100%)"
      >
        <Stack gap="xs">
          <Group justify="space-between" pr="sm">
            <Stack gap={4}>
              <Title order={2} fw={700}>
                Software Development
              </Title>
              <Text fw={500}>BS Information Technology</Text>
            </Stack>

            <ThemeIcon variant="transparent" radius="xl" size="xl" c="white">
              <IconCode size={44} />
            </ThemeIcon>
          </Group>

          <Divider opacity={0.3} />

          <Text size="sm" c="gray.1">
            This course focuses on the core aspects of IT and software
            engineering.
          </Text>
        </Stack>

        <Group mt="md">
          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              4 Years
            </Text>
          </Card>

          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              3 Semesters
            </Text>
          </Card>
          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              150 Units
            </Text>
          </Card>
        </Group>
      </Card>

      <Stack>
        <Title order={4} fw={700}>
          Curriculum Plan
        </Title>
        <Divider />
        <YearLevels />
      </Stack>
    </Container>
  )
}

interface Curriculum {
  year: number
  semesters: Semester[]
}

interface Semester {
  semester: number
  courses: Course[]
}

interface Course {
  id: string
  code: string
  name: string
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
}

const mockCurriculum: Curriculum[] = [
  {
    year: 1,
    semesters: [
      {
        semester: 1,
        courses: [
          {
            id: 'c2',
            code: 'MO-GE102',
            name: 'Philippine Popular Culture',
            type: 'General',
            department: 'GE',
            units: 3,
          },
        ],
      },
      {
        semester: 2,
        courses: [
          {
            id: 'c3',
            code: 'MO-IT200D2',
            name: 'Capstone 2',
            type: 'Core',
            department: 'IT',
            units: 3,
          },
          {
            id: 'c4',
            code: 'MO-IT151',
            name: 'Platform Technologies',
            type: 'Major',
            department: 'IT',
            units: 3,
          },
        ],
      },
    ],
  },
  {
    year: 2,
    semesters: [
      {
        semester: 1,
        courses: [
          {
            id: 'c5',
            code: 'GE-MATH2',
            name: 'Discrete Mathematics',
            type: 'General',
            department: 'GE',
            units: 3,
          },
        ],
      },
    ],
  },
]

function YearLevels() {
  const data = mockCurriculum

  return (
    <Stack gap="lg">
      <Accordion
        variant="separated"
        radius="md"
        multiple
        defaultValue={data.map((year) => year.year.toString())}
      >
        {data.map((year) => (
          // <Card withBorder radius="md" shadow="sm" p="md" key={year.year}>
          <Accordion.Item key={year.year} value={year.year.toString()}>
            <Accordion.Control>
              <Group gap="xs" c="primary">
                <IconBookFilled size={20} />
                <Text fw={500}>Year {year.year}</Text>
              </Group>
            </Accordion.Control>

            <Accordion.Panel>
              <Stack gap="lg">
                <Accordion
                  variant="filled"
                  multiple
                  defaultValue={year.semesters.map((sem) =>
                    sem.semester.toString(),
                  )}
                >
                  {year.semesters.map((sem) => (
                    <SemesterSection key={sem.semester} {...sem} />
                  ))}
                </Accordion>
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          // </Card>
        ))}
      </Accordion>
    </Stack>
  )
}

const semesterLabels: Record<number, string> = {
  1: 'First Semester',
  2: 'Second Semester',
  3: 'Third Semester',
  4: 'Fourth Semester',
}

function SemesterSection({ semester, courses }: Semester) {
  return (
    <Stack>
      <Accordion.Item key={semester} value={semester.toString()}>
        <Accordion.Control>
          <Group gap="xs" c="primary">
            <IconBook2 size={20} />
            <Text fw={500}>{semesterLabels[semester]}</Text>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack>
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Stack>
  )
}

function CourseCard(props: Course) {
  return (
    <Card shadow="none" radius="md" withBorder p="md">
      <Group justify="space-between" align="start">
        <Stack gap={2}>
          <Text fw={500}>{props.name}</Text>
          <Text size="sm" c="dimmed">
            {props.code}
          </Text>
        </Stack>
        <Group gap="xs">
          <Badge color="blue" size="sm" variant="light">
            {props.type}
          </Badge>
          <Badge color="gray" size="sm" variant="outline">
            {props.units} units
          </Badge>
        </Group>
      </Group>
    </Card>
  )
}

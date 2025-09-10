import type { CurriculumCourseItemDto } from '@/integrations/api/client'
import { curriculumControllerFindOneOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
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
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useRouter } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/curriculum/$curriculumCode')

export default function CurriculumView() {
  const router = useRouter()
  const { curriculumCode } = route.useParams()

  const { data: data } = useSuspenseQuery(
    curriculumControllerFindOneOptions({
      path: { id: curriculumCode },
    }),
  )

  const curriculum = data.curriculum
  const courses = data.courses

  const years = Math.max(...courses.map((item) => item.year))
  const sems = Math.max(...courses.map((item) => item.semester))
  const units = courses.reduce((acc, curr) => acc + curr.course.units, 0)

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
                {curriculum.major.name}
              </Title>
              <Text fw={500}>{curriculum.program.name}</Text>
            </Stack>

            <ThemeIcon variant="transparent" radius="xl" size="xl" c="white">
              <IconCode size={44} />
            </ThemeIcon>
          </Group>

          <Divider opacity={0.3} />

          <Text size="sm" c="gray.1">
            {curriculum.description}
          </Text>
        </Stack>

        <Group mt="md">
          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              {years} Years
            </Text>
          </Card>

          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              {sems} Semesters
            </Text>
          </Card>
          <Card radius="xl" px="md" py={4} bg="rgba(255,255,255,0.15)">
            <Text c="white" size="xs">
              {units} Units
            </Text>
          </Card>
        </Group>
      </Card>

      <Stack>
        <Title order={4} fw={700}>
          Curriculum Plan
        </Title>
        <Divider />
        <YearLevels courses={courses} />
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
  courses: CurriculumCourseItemDto[]
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

function YearLevels({ courses }: { courses: CurriculumCourseItemDto[] }) {
  const data: Curriculum[] = Object.entries(
    courses.reduce<Record<number, Record<number, CurriculumCourseItemDto[]>>>(
      (acc, c) => {
        ;(acc[c.year] ??= {})[c.semester] ??= []
        acc[c.year][c.semester].push(c)
        return acc
      },
      {},
    ),
  ).map(([year, semesters]) => ({
    year: +year,
    semesters: Object.entries(semesters).map(([sem, list]) => ({
      semester: +sem,
      courses: list,
    })),
  }))

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

function CourseCard(props: CurriculumCourseItemDto) {
  return (
    <Card shadow="none" radius="md" withBorder p="md">
      <Group justify="space-between" align="start">
        <Stack gap={2}>
          <Text fw={500}>{props.course.name}</Text>
          <Text size="sm" c="dimmed">
            {props.course.courseCode}
          </Text>
        </Stack>
        <Group gap="xs">
          {/* <Badge color="blue" size="sm" variant="light">
            {props.type}
          </Badge> */}
          <Badge color="gray" size="sm" variant="outline">
            {props.course.units} units
          </Badge>
        </Group>
      </Group>
    </Card>
  )
}

import { IconSelector } from '@/components/icon-selector'
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconBook2,
  IconBookFilled,
  IconDeviceFloppy,
  IconGripVertical,
  IconMinus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { memo, useState, type Dispatch } from 'react'
import Droppable from '@/integrations/dnd-kit/droppable'
import { useImmer, useImmerReducer } from 'use-immer'
import Sortable from '@/integrations/dnd-kit/sortable'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import { AnimatePresence, motion } from 'motion/react'

export default function CurriculumBuilder() {
  const router = useRouter()

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Group mb="lg" justify="space-between">
        <Group align="start">
          <ActionIcon
            variant="subtle"
            radius="lg"
            mt={4}
            onClick={() => router.history.back()}
          >
            <IconArrowLeft />
          </ActionIcon>
          <Stack gap={0}>
            <Title c={'dark.7'} variant="hero" order={2} fw={700}>
              Curriculum Builder
            </Title>
            <Text c={'dark.3'} fw={500}>
              Create a new curriculum for a program and major
            </Text>
          </Stack>
        </Group>

        <Group>
          <Button leftSection={<IconDeviceFloppy size={20} />}>Save</Button>
        </Group>
      </Group>

      <Stack>
        <Group>
          <Autocomplete
            variant="filled"
            label="Program"
            // description="The curriculum's program"
            placeholder="Pick a program"
            selectFirstOptionOnChange
            data={['BS Information Technology', 'BS Business Administration']}
            withAsterisk
            className="flex-1"
          />
          <Autocomplete
            variant="filled"
            label="Major"
            // description="The major for the program"
            placeholder="Pick a major"
            selectFirstOptionOnChange
            data={[
              'Software Development',
              'Data Analytics',
              'Networking & Cybersecurity',
            ]}
            withAsterisk
            className="flex-1"
          />
          <IconSelector variant="filled" w={120} />
        </Group>

        <Textarea
          variant="filled"
          label="Description"
          placeholder="Write the description here..."
          autosize
          minRows={4}
        />

        <Stack>
          <Title order={4} fw={700}>
            Curriculum Plan
          </Title>
          <YearLevels />
        </Stack>
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

interface CurriculumCourse {
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
  year: number
  semester: number
}

const mockCourses: CurriculumCourse[] = [
  {
    id: 'c2',
    code: 'MO-GE102',
    name: 'Philippine Popular Culture',
    type: 'General',
    department: 'GE',
    units: 3,
    year: 1,
    semester: 1,
  },
  {
    id: 'c3',
    code: 'MO-IT200D2',
    name: 'Capstone 2',
    type: 'Core',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 2,
  },
  {
    id: 'c4',
    code: 'MO-IT151',
    name: 'Platform Technologies',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 2,
  },
  {
    id: 'c5',
    code: 'MO-IT121',
    name: 'Mobile Develpment',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 3,
  },
  {
    id: 'c6',
    code: 'GE-MATH2',
    name: 'Discrete Mathematics',
    type: 'General',
    department: 'GE',
    units: 3,
    year: 2,
    semester: 1,
  },
]

interface YearStructure {
  year: number
  semesters: number[]
}

const baseStructure: YearStructure[] = [
  {
    year: 1,
    semesters: [1, 2, 3],
  },
  {
    year: 2,
    semesters: [1, 2, 3],
  },
  {
    year: 3,
    semesters: [1, 2, 3],
  },
  {
    year: 4,
    semesters: [1, 2, 3],
  },
]

const mockSortable: Record<string, string[]> = {
  '1-1': ['MO-GE102'],
  '1-2': ['MO-IT200D2', 'MO-IT151'],
  '1-3': ['MO-IT121'],
  '2-1': ['GE-MATH2'],
  '2-2': [],
  '2-3': [],
  '3-1': [],
  '3-2': [],
  '3-3': [],
  '4-1': [],
  '4-2': [],
  '4-3': [],
}

type StructureAction = { type: 'ADD_YEAR' }

const structureReducer = (draft: YearStructure[], action: StructureAction) => {
  switch (action.type) {
    case 'ADD_YEAR': {
      draft.push({
        year: draft.length + 1,
        semesters: [1, 2, 3],
      })
      break
    }
    default: {
      break
    }
  }
}

function YearLevels() {
  const [data, setData] = useImmer(mockCourses)
  // const [structure, dispatchStructure] = useImmerReducer(
  //   structureReducer,
  //   baseStructure,
  // )
  const [sortables, setSortables] = useImmer(mockSortable)

  const courses: Record<string, CurriculumCourse[]> = Object.fromEntries(
    Object.entries(sortables).map(([key, codes]) => [
      key,
      codes
        .map((code) => data.find((course) => course.code === code))
        .filter((course): course is CurriculumCourse => Boolean(course)),
    ]),
  )

  const structure: YearStructure[] = Object.keys(sortables).reduce<
    YearStructure[]
  >((acc, key) => {
    const [yearStr, semStr] = key.split('-')
    const year = Number(yearStr)
    const sem = Number(semStr)

    const existing = acc.find((y) => y.year === year)
    if (existing) {
      if (!existing.semesters.includes(sem)) {
        existing.semesters.push(sem)
      }
    } else {
      acc.push({ year, semesters: [sem] })
    }

    return acc
  }, [])

  return (
    <Stack gap="lg">
      <DragDropProvider
        onDragOver={(event) => {
          setSortables((items) => move(items, event))
        }}
      >
        {structure.map((year) => (
          <YearCard
            key={year.year}
            courses={courses}
            // dispatchStructure={dispatchStructure}
            {...year}
          />
        ))}
        <DragOverlay>
          {(source) => {
            const active = data.find((course) => course.code === source?.id)

            if (!active) return
            return <CourseCard {...active} isOverlay />
          }}
        </DragOverlay>
      </DragDropProvider>

      <Button
        variant="outline"
        leftSection={<IconPlus />}
        c="dimmed"
        bd="1px solid dimmed"
        // onClick={() => dispatchStructure({ type: 'ADD_YEAR' })}
      >
        Add Year
      </Button>
    </Stack>
  )
}

const YearCard = memo(function YearCard({
  year,
  semesters,
  courses,
}: YearStructure & {
  courses: Record<string, CurriculumCourse[]>
  // dispatchStructure: Dispatch<StructureAction>
}) {
  return (
    <Card
      withBorder
      radius="md"
      shadow="sm"
      p="md"
      key={year}
      bg="#fbfbfb"
      className="group/year overflow-visible"
    >
      <Group justify="space-between" mb="sm">
        <Group gap="xs" c="primary">
          <IconBookFilled size={20} />
          <Text fw={500}>Year {year}</Text>
        </Group>

        <Group gap={4}>
          <Button
            variant="outline"
            size="xs"
            leftSection={<IconPlus size={16} />}
            className="opacity-0 group-hover/year:opacity-100"
          >
            Add Semester
          </Button>
          <ActionIcon
            variant="subtle"
            className="opacity-0 group-hover/year:opacity-100"
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack gap="lg">
        {semesters.map((sem) => (
          <Droppable key={`${year}-${sem}`} id={`${year}-${sem}`}>
            <SemesterCard
              year={year}
              semester={sem}
              courses={courses[`${year}-${sem}`]}
            />
          </Droppable>
        ))}
      </Stack>
    </Card>
  )
})

const SemesterCard = memo(function SemesterCard(props: {
  year: number
  semester: number
  courses: CurriculumCourse[]
}) {
  return (
    <Card
      shadow="none"
      radius="md"
      withBorder
      className="group/sem overflow-visible transition-colors"
      bg="#fdfdfd"
    >
      <Group justify="space-between" mb="sm">
        <Group gap="xs" c="primary" mb="sm">
          <IconBook2 size={20} />
          <Text fw={500}>Semester {props.semester}</Text>
        </Group>

        <Group gap={4}>
          <Button
            variant="outline"
            size="xs"
            leftSection={<IconPlus size={16} />}
            className="opacity-0 group-hover/sem:opacity-100"
          >
            Add Course
          </Button>
          <ActionIcon
            variant="subtle"
            className="opacity-0 group-hover/sem:opacity-100"
          >
            <IconTrash size={20} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack>
        {props.courses.map((course, idx) => (
          <Sortable
            key={course.id}
            id={course.code}
            index={idx}
            column={`${props.year}-${props.semester}`}
          >
            {({ handleRef, isDragging }) => (
              <CourseCard
                handleRef={handleRef}
                isDragging={isDragging}
                {...course}
              />
            )}
          </Sortable>
        ))}
      </Stack>
    </Card>
  )
})

const CourseCard = memo(function CourseCard(
  props: Course & {
    handleRef?: (element: Element | null) => void
    isDragging?: boolean
    isOverlay?: boolean
  },
) {
  return (
    <Group gap={4} opacity={props.isDragging ? 0.3 : 1}>
      <Card flex={1} radius="md" withBorder p="md" className="overflow-visible">
        <Group justify="space-between" h="100%" align="center">
          <Stack gap={2}>
            <Text fw={500}>{props.name}</Text>
            <Text size="sm" c="dimmed">
              {props.code}
            </Text>
          </Stack>

          <Group h="100%" align="center">
            <Group h="100%" gap="xs">
              <Badge color="blue" size="sm" variant="light">
                {props.type}
              </Badge>
              <Badge color="gray" size="sm" variant="outline">
                {props.units} units
              </Badge>
            </Group>

            <ActionIcon
              ref={props.handleRef}
              variant="transparent"
              radius="lg"
              c="dimmed"
            >
              <IconGripVertical />
            </ActionIcon>
          </Group>
        </Group>
      </Card>

      <ActionIcon
        variant="subtle"
        radius="xl"
        className={props.isOverlay ? 'invisible' : ''}
      >
        <IconMinus size={20} />
      </ActionIcon>
    </Group>
  )
})

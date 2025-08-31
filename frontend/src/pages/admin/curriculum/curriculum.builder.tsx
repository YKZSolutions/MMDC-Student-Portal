import { IconSelector } from '@/components/icon-selector'
import {
  ActionIcon,
  Autocomplete,
  Badge,
  Button,
  Card,
  Container,
  Drawer,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
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
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { useRouter } from '@tanstack/react-router'
import { memo, useEffect, type Dispatch } from 'react'
import Droppable from '@/integrations/dnd-kit/droppable'
import { useImmer, type Updater } from 'use-immer'
import Sortable from '@/integrations/dnd-kit/sortable'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import Draggable from '@/integrations/dnd-kit/draggable'
import { Route } from '@/routes/(protected)/curriculum/$curriculumId_.edit'
import {
  mockCourses,
  useCurriculumBuilder,
  type CurriculumCourse,
  type StructureAction,
  type YearStructure,
} from '@/features/curriculum/hooks/curriculum.builder.hook'

export default function CurriculumBuilder() {
  const router = useRouter()
  const navigate = Route.useNavigate()

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
          <Group justify="space-between">
            <Title order={4} fw={700}>
              Curriculum Plan
            </Title>

            <Button
              onClick={() =>
                navigate({
                  search: (prev) => ({
                    openCourseList:
                      prev.openCourseList !== true ? true : undefined,
                  }),
                })
              }
            >
              Course List
            </Button>
          </Group>
          <YearLevels />
        </Stack>
      </Stack>
    </Container>
  )
}

function YearLevels() {
  const { structure, courses, currentCourses, setCurrentCourses, dispatch } =
    useCurriculumBuilder()

  // useEffect(() => {
  //   console.log(currentCourses)
  // }, [currentCourses])
  // useEffect(() => {
  //   console.log(courses)
  // }, [courses])

  return (
    <Stack gap="lg">
      <DragDropProvider
        onDragOver={(event) => {
          const { source, target } = event.operation
          if (!source || !target) return

          if (source?.data !== undefined && source.data.external === true) {
            const { course } = source.data
            if (!course) return

            dispatch({
              type: 'ADD_COURSE_DRAG',
              payload: { key: target.id.toString(), course: course.code },
            })
            setCurrentCourses((draft) => {
              draft.push(course)
            })
          } else {
            dispatch({ type: 'SET', payload: (items) => move(items, event) })
          }
        }}
        onDragEnd={(event) => {
          const { source, target } = event.operation
          if (!source || !target) return

          let id = ''
          if ('sortable' in target) {
            const sortable = target.sortable as { group: string }
            id = sortable.group
          } else {
            id = target.id.toString()
          }
          const [year, sem] = id.split('-').map(Number)

          setCurrentCourses((draft) => {
            const draggedCourse = draft.find(
              (course) => course.code === source.id,
            )
            if (draggedCourse) {
              draggedCourse.year = year
              draggedCourse.semester = sem
            }
          })
        }}
      >
        <CourseList currentCourses={currentCourses} />
        {structure.map((year) => (
          <YearCard
            key={year.year}
            courses={courses}
            dispatch={dispatch}
            setCurrentCourses={setCurrentCourses}
            {...year}
          />
        ))}
        <DragOverlay>
          {(source) => {
            const { external, course } = source.data
            return (
              <Group gap={4}>
                <CourseCard {...course} isOverlay isBase={external === true} />
                {external !== true && (
                  <ActionIcon variant="subtle" radius="xl"></ActionIcon>
                )}
              </Group>
            )
          }}
        </DragOverlay>
      </DragDropProvider>

      <Button
        variant="outline"
        leftSection={<IconPlus />}
        c="dimmed"
        bd="1px solid dimmed"
        onClick={() => dispatch({ type: 'ADD_YEAR' })}
      >
        Add Year
      </Button>
    </Stack>
  )
}

function CourseList({
  currentCourses,
}: {
  currentCourses: CurriculumCourse[]
}) {
  const { openCourseList } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [data, setData] = useImmer(mockCourses)

  const availableCourses = data.filter(
    (course) =>
      !currentCourses.some((currCourse) => currCourse.code === course.code),
  )

  return (
    <>
      <Drawer
        opened={!!openCourseList}
        onClose={() =>
          navigate({
            search: {
              openCourseList: undefined,
            },
          })
        }
        title="Course List"
        withOverlay={false}
        lockScroll={false}
        size="sm"
      >
        <Stack>
          <TextInput leftSection={<IconSearch />} placeholder="Search course" />
          <Stack gap="xs">
            {availableCourses.map((course) => (
              <Draggable
                key={course.id}
                id={course.code}
                data={{
                  external: true,
                  course: course,
                }}
              >
                {({ handleRef }) => (
                  <CourseCard handleRef={handleRef} isBase {...course} />
                )}
              </Draggable>
            ))}
          </Stack>
        </Stack>
      </Drawer>
    </>
  )
}

const YearCard = memo(function YearCard({
  year,
  semesters,
  courses,
  dispatch,
  setCurrentCourses,
}: YearStructure & {
  courses: Record<string, CurriculumCourse[]>
  dispatch: Dispatch<StructureAction>
  setCurrentCourses: Updater<CurriculumCourse[]>
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
            onClick={() => dispatch({ type: 'ADD_SEM', payload: { year } })}
          >
            Add Semester
          </Button>
          <ActionIcon
            variant="subtle"
            className="opacity-0 group-hover/year:opacity-100"
            onClick={() => {
              dispatch({ type: 'DEL_YEAR', payload: { year } })
              setCurrentCourses((draft) =>
                draft.filter((course) => course.year !== year),
              )
            }}
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
              dispatch={dispatch}
              setCurrentCourses={setCurrentCourses}
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
  dispatch: Dispatch<StructureAction>
  setCurrentCourses: Updater<CurriculumCourse[]>
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
            onClick={() => {
              props.dispatch({
                type: 'DEL_SEM',
                payload: { year: props.year, sem: props.semester },
              })
              props.setCurrentCourses((draft) =>
                draft.filter(
                  (course) =>
                    course.year !== props.year &&
                    course.semester !== props.semester,
                ),
              )
            }}
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
            data={{ course }}
          >
            {({ handleRef, isDragging }) => (
              <Group
                gap={4}
                opacity={isDragging ? 0.3 : 1}
                className="group/delete"
              >
                <CourseCard handleRef={handleRef} {...course} />
                <ActionIcon
                  variant="subtle"
                  radius="xl"
                  className="w-0 group-hover/delete:w-auto"
                  onClick={() => {
                    props.dispatch({
                      type: 'DEL_COURSE',
                      payload: {
                        year: props.year,
                        sem: props.semester,
                        course: course.code,
                      },
                    })

                    props.setCurrentCourses((draft) =>
                      draft.filter(
                        (currCourse) => currCourse.code !== course.code,
                      ),
                    )
                  }}
                >
                  <IconMinus size={20} />
                </ActionIcon>
              </Group>
            )}
          </Sortable>
        ))}
      </Stack>
    </Card>
  )
})

const CourseCard = memo(function CourseCard(
  props: CurriculumCourse & {
    handleRef?: (element: Element | null) => void
    isBase?: boolean
  },
) {
  return (
    <Card flex={1} radius="md" withBorder p="md" className="overflow-visible">
      <Group justify="space-between" h="100%" align="center" wrap="nowrap">
        <Stack gap={2}>
          <Text fw={500} className="truncate">
            {props.name}
          </Text>
          <Text size="sm" c="dimmed">
            {props.code}
          </Text>
        </Stack>

        <Group h="100%" align="center" wrap="nowrap">
          <Group h="100%" gap="xs" className={props.isBase ? 'flex-col' : ''}>
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
  )
})

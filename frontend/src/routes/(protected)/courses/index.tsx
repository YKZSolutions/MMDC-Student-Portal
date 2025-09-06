import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  AcademicProgram,
  AcademicTerm,
  ClassMeeting,
  Course,
} from '@/features/courses/types'
import { Component, useState } from 'react'
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Image,
  Progress,
  RingProgress,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core'
import SearchComponent from '@/components/search-component.tsx'
import {
  IconCalendarTime,
  IconDeviceDesktop,
  IconFilter,
  IconLayoutGridFilled,
  IconList,
  IconUserCode,
  IconVideo,
} from '@tabler/icons-react'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import { useCurrentMeeting } from '@/features/courses/hooks/useCurrentMeeting.ts'
import CourseDashboardQuickActions from '@/features/courses/dashboard/course-dashboard-quick-actions.tsx'
import {
  type FilterInputType,
  type FilterType,
  MultiFilter,
} from '@/components/multi-filter.tsx'
import { useFilter } from '@/hooks/useFilter.ts'
import { createFilterOption } from '@/utils/helpers.ts'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
  loader: ({ context }) => {
    return mockTerms //TODO: replace this with actual fetch
  },
})

const mockTerms: AcademicTerm[] = [
  {
    termId: 'termId1',
    schoolYear: 'SY 2024-2025',
    term: 'Term 1',
    isCurrent: false,
  },
  {
    termId: 'termId2',
    schoolYear: 'SY 2024-2025',
    term: 'Term 2',
    isCurrent: false,
  },
  {
    termId: 'termId3',
    schoolYear: 'SY 2024-2025',
    term: 'Term 3',
    isCurrent: false,
  },
  {
    termId: 'termId4',
    schoolYear: 'SY 2025-2026',
    term: 'Term 1',
    isCurrent: true,
  },
]

const mockAcademicPrograms: AcademicProgram[] = [
  {
    program: 'Bachelor of Science in Information Technology',
    programCode: 'BSIT',
    major: 'Software Development',
    majorCode: 'SD',
  },
  {
    program: 'Bachelor of Science in Computer Science',
    programCode: 'BSCS',
    major: 'Software Engineering',
    majorCode: 'SE',
  },
  {
    program: 'Bachelor of Science in Information Systems',
    programCode: 'BSIS',
    major: 'Information Systems',
    majorCode: 'IS',
  },
]

// TODO: Consider adding program and/or department and major to the course data
// TODO: Course types might also be necessary such as 'General Education', 'Specialization', etc.
const MockCourseData: Course[] = [
  {
    courseName: 'Web Technology Applications',
    courseCode: 'MO-IT200',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[0],
    academicTerms: [mockTerms[0]],
  },
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'MO-IT351',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[1],
    academicTerms: [mockTerms[1]],
  },

  {
    courseName: 'Capstone 1',
    courseCode: 'MO-IT400',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T15:45',
          endTimeStamp: '2023-08-20T22:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
    program: mockAcademicPrograms[2],
    academicTerms: [mockTerms[2]],
  },
  {
    courseName: 'Capstone 2',
    courseCode: 'MO-IT500',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2025-08-23T00:00',
          endTimeStamp: '2025-08-29T23:59',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [
      {
        activityName: 'Assignment 1',
        dueTimestamp: '2025-08-20T23:59:59',
      },
      {
        activityName: 'Assignment 2',
        dueTimestamp: '2025-08-20T23:59:59',
      },
    ],
    program: mockAcademicPrograms[0],
    academicTerms: [mockTerms[3]],
  },
]

// Course-specific filter configuration
export const courseFilterConfig = {
  Program: (course: Course, value: string) => {
    const programCode = course.program.programCode
    return programCode.toLowerCase() === value.toLowerCase()
  },

  Term: (course: Course, value: string) => {
    if (value === 'current' && course.academicTerms.length > 0) {
      const currentTerm = course.academicTerms.find((term) => term.isCurrent)
      if (currentTerm) return true
    }

    return course.academicTerms.some((term) => {
      const termId = term.termId
      return termId.toLowerCase() === value.toLowerCase()
    })
  },

  Schedule: (course: Course, value: string) => {
    return course.section.sectionSchedule.day //TODO: Placeholder - implement the logic
      .toLowerCase()
      .includes(value.toLowerCase())
  },
}

function RouteComponent() {
  const { authUser } = useAuth('protected') //TODO: use this later for fetching enrolled terms
  const academicTerms = Route.useLoaderData() //TODO: replace with suspense query
  const academicPrograms = mockAcademicPrograms

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchFilteredCourses, setSearchFilteredCourses] =
    useState<Course[]>(MockCourseData)

  //TODO: implement API call to get courses, get it by academic term Id
  const coursesData = MockCourseData

  const formatTerm = (academicTerm: AcademicTerm | undefined) => {
    return academicTerm
      ? `${academicTerm.schoolYear} - ${academicTerm.term}`
      : 'N/A'
  }

  const filters: FilterType[] = [
    {
      label: 'Term',
      icon: <IconCalendarTime size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Current', value: 'current' },
        ...academicTerms.map((term) => createFilterOption(formatTerm(term))),
      ],
    },
    ...(authUser?.role !== 'student'
      ? [
          {
            label: 'Program',
            icon: <IconUserCode size={16} />,
            type: 'select' as FilterInputType,
            value: '',
            options: [
              ...academicPrograms.map((program) =>
                createFilterOption(program.programCode),
              ),
            ],
          },
        ]
      : []),
  ]

  const defaultFilters: FilterType[] = [
    {
      ...filters[0],
      value: 'current',
    },
  ]

  const [showFilters, setShowFilters] = useState(true)

  const {
    activeFilters,
    filteredData,
    activeFilterCount,
    handleAddFilter,
    handleRemoveFilter,
    handleFilterChange,
  } = useFilter(defaultFilters, searchFilteredCourses, courseFilterConfig)

  return (
    <Container fluid m={0}>
      <Stack gap={'lg'}>
        <Header
          coursesData={coursesData}
          onSearchFilter={setSearchFilteredCourses}
          filters={filters}
          activeFilters={activeFilters}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleFilterChange={handleFilterChange}
          showFilters={showFilters}
          onToggleShowFilter={setShowFilters}
          activeFilterCount={activeFilterCount}
          view={view}
          onViewChange={setView}
        />
        <Group wrap={'wrap-reverse'} align="start" gap={'md'} w={'100%'}>
          {/*Courses*/}
          <Group
            wrap="wrap"
            gap={'md'}
            style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
          >
            {filteredData.map((course, index) => (
              <CourseItem
                url={`/courses/${course.courseCode}`}
                key={index}
                course={course}
                variant={view}
              />
            ))}
          </Group>
          {/*Upcoming Tasks*/}
          {authUser.role === 'student' && (
            <div
              className={'self-end'}
              style={{ flexGrow: 1, flexBasis: '20%', minWidth: 250 }}
            >
              <CourseTasksSummary courses={filteredData} />
            </div>
          )}
        </Group>
      </Stack>
    </Container>
  )
}

type HeaderProps = {
  coursesData: Course[]
  onSearchFilter: (courses: Course[]) => void
  filters: FilterType[]
  activeFilters: FilterType[]
  handleAddFilter: (filterType: FilterType) => void
  handleRemoveFilter: (index: number) => void
  handleFilterChange: (index: number, value: string) => void
  showFilters: boolean
  onToggleShowFilter: (show: boolean) => void
  activeFilterCount: number
  view: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
}

const Header = ({
  coursesData,
  onSearchFilter,
  filters,
  activeFilters,
  handleAddFilter,
  handleRemoveFilter,
  handleFilterChange,
  showFilters,
  onToggleShowFilter,
  activeFilterCount,
  view,
  onViewChange,
}: HeaderProps) => {
  return (
    <Stack gap={'xs'}>
      <Group justify="space-between" align="center">
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Courses
        </Title>
        {/*Filters*/}
        <Group justify="space-between" align="center">
          <SearchComponent //TODO: might need to replace this later if paging should be implemented
            data={coursesData}
            onFilter={onSearchFilter}
            identifiers={['courseName']}
            placeholder={'Search courses'}
          />
          <Group>
            <ViewSelectorButton
              view={view}
              onGridClick={() => onViewChange('grid')}
              onListClick={() => onViewChange('list')}
            />
            <FilterButton
              showFilters={showFilters}
              filterCount={activeFilterCount}
              onClick={() => onToggleShowFilter(!showFilters)}
            />
          </Group>
        </Group>
      </Group>
      <Box hidden={!showFilters}>
        <CourseDashboardFilters
          filters={filters}
          activeFilters={activeFilters}
          onAddFilter={handleAddFilter}
          onRemoveFilter={handleRemoveFilter}
          onFilterChange={handleFilterChange}
        />
      </Box>
      <Divider />
    </Stack>
  )
}

class FilterButton extends Component<{
  showFilters: boolean
  filterCount: number
  onClick: () => void
}> {
  render() {
    return (
      <Tooltip label={this.props.showFilters ? 'Hide Filters' : 'Show Filters'}>
        <ActionIcon
          variant={'subtle'}
          c={
            this.props.filterCount !== 0 || this.props.showFilters
              ? 'blue.6'
              : 'gray.6'
          }
          onClick={this.props.onClick}
        >
          <IconFilter size={20} />
        </ActionIcon>
      </Tooltip>
    )
  }
}

class SelectorButton extends Component<{
  active: boolean
  icon: React.ReactNode
  onClick: () => void
}> {
  render() {
    return (
      <Button
        variant="default"
        radius={'md'}
        bg={this.props.active ? 'gray.3' : 'gray.0'}
        size={'xs'}
        onClick={this.props.onClick}
      >
        <div color={this.props.active ? 'black' : 'dark.2'}>
          {this.props.icon}
        </div>
      </Button>
    )
  }
}

class ViewSelectorButton extends Component<{
  view: 'grid' | 'list'
  onGridClick: () => void
  onListClick: () => void
}> {
  render() {
    return (
      <Button.Group>
        <SelectorButton
          active={this.props.view === 'grid'}
          onClick={this.props.onGridClick}
          icon={<IconLayoutGridFilled size={20} />}
        />
        <SelectorButton
          active={this.props.view === 'list'}
          onClick={this.props.onListClick}
          icon={<IconList size={20} />}
        />
      </Button.Group>
    )
  }
}

type CourseDashboardFiltersProps = {
  filters: FilterType[]
  activeFilters: FilterType[]
  onAddFilter: (filterType: FilterType) => void
  onRemoveFilter: (index: number) => void
  onFilterChange: (index: number, value: string) => void
}

const CourseDashboardFilters = ({
  filters,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
}: CourseDashboardFiltersProps) => {
  return (
    <Group gap={'md'} align="start">
      <MultiFilter
        filters={filters}
        activeFilters={activeFilters.map((filter, index) => ({
          ...filter,
          onChange: (value) => onFilterChange(index, value),
        }))}
        onAddFilter={onAddFilter}
        onRemoveFilter={onRemoveFilter}
      />
    </Group>
  )
}

const CourseItem = ({
  url,
  course,
  variant,
}: {
  url: string
  course: Course
  variant: 'grid' | 'list'
}) => {
  return variant === 'grid' ? (
    <CourseCard url={url} {...course} />
  ) : (
    <CourseListRow url={url} {...course} />
  )
}

interface CourseDetailProps extends Omit<Course, 'activities'> {
  url: string
}

const CourseCard = ({ url, ...courseDetails }: CourseDetailProps) => {
  const theme = useMantineTheme()

  const { sectionName, sectionSchedule, classMeetings } = courseDetails.section
  const { courseName, courseCode, courseProgress } = courseDetails
  const { currentMeeting } = useCurrentMeeting(classMeetings)

  return (
    <Card
      withBorder
      radius="md"
      p="xs"
      className={'drop-shadow-sm hover:drop-shadow-lg'}
    >
      {/*Image*/}
      <Flex pos="relative">
        <Image
          src="https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Norway"
          radius="md"
          miw="100%"
          h="5.375rem"
        />
        <Text
          pos="absolute"
          top="4px"
          left="4px"
          size="0.625em"
          fw={500}
          c="white"
          px="sm"
          py="xs"
          bdrs="md"
          bg="black"
          opacity={0.75}
        >
          {courseCode} • {sectionName}
        </Text>
      </Flex>
      {/*Course Details*/}
      <Group justify="space-between" wrap="nowrap" mt="xs">
        <Stack gap={'md'} w={'16rem'} px={'xs'}>
          <Stack mt={'xs'}>
            <Tooltip label={courseName}>
              <Link to={url} className="hover:underline">
                <Title
                  order={3}
                  w={'100%'}
                  lineClamp={1}
                  c={theme.primaryColor}
                >
                  {courseName}
                </Title>
              </Link>
            </Tooltip>
            <Text fw={400} size={'sm'} c={theme.colors.dark[3]}>
              {sectionSchedule.day} {sectionSchedule.time}
            </Text>
          </Stack>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={courseCode}
          />
          <Group justify="space-between">
            <Group gap="0.25rem">
              <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                Completed
              </Text>
              <Group gap="0">
                <RingProgress
                  size={20}
                  thickness={3}
                  sections={[
                    {
                      value: courseProgress * 100,
                      color: theme.colors.blue[5],
                    },
                  ]}
                />
                <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                  {courseProgress * 100}%
                </Text>
              </Group>
            </Group>
            <CourseDashboardQuickActions />
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

const CourseListRow = ({ url, ...courseDetails }: CourseDetailProps) => {
  const { sectionName, sectionSchedule, classMeetings } = courseDetails.section
  const { courseName, courseCode, courseProgress } = courseDetails
  const { currentMeeting } = useCurrentMeeting(classMeetings)

  return (
    <Card
      withBorder
      radius="md"
      p="0"
      className={'drop-shadow-sm hover:drop-shadow-lg'}
      w={'100%'}
    >
      <Group justify="space-between" wrap="nowrap">
        <Box bg={'primary'} h={'100%'} w={'20px'}></Box>
        <Stack w={'65%'} p={'xs'} justify={'space-between'}>
          <Group gap={'xs'}>
            <Link to={url} className="hover:underline">
              <Title order={3} lineClamp={1} c={'primary'}>
                {courseName}
              </Title>
            </Link>
            <CourseDashboardQuickActions />
          </Group>
          <Text fw={400} size={'sm'} c={'dark.3'}>
            {courseCode} • {sectionName} | {sectionSchedule.day}{' '}
            {sectionSchedule.time}
          </Text>
        </Stack>
        <Stack w={'30%'} p={'xs'} justify={'space-between'}>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={courseCode}
          />
          <Group gap="xs">
            <Text fw={500} size={'xs'} c={'dark.3'}>
              Completed:
            </Text>
            <Progress color={'blue.5'} value={50} w={'50%'} />
            <Text fw={500} size={'xs'} c={'dark.3'}>
              {courseProgress * 100}%
            </Text>
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

type CourseCardActionButtonProps = {
  currentMeeting?: ClassMeeting
  courseCode: string
}
const CourseCardActionButton = ({
  currentMeeting,
  courseCode,
}: CourseCardActionButtonProps) => {
  const { authUser } = useAuth('protected')
  return (
    <Button
      component={Link}
      leftSection={
        authUser.role === 'student' ? (
          <IconVideo size={16} />
        ) : (
          <IconDeviceDesktop size={16} />
        )
      }
      size="xs"
      radius="xl"
      variant="filled"
      disabled={authUser.role === 'student' ? !currentMeeting : false}
      to={
        authUser.role === 'student'
          ? currentMeeting?.meetingLink
          : `/courses/${courseCode}/edit`
      }
    >
      {authUser.role === 'student'
        ? 'Join Meeting'
        : authUser.role === 'mentor'
          ? 'Start Meeting'
          : 'Manage Content'}
    </Button>
  )
}

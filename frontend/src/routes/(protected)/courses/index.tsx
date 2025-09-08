import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import type {
  ClassMeeting,
  Course,
  EnrolledCourse,
} from '@/features/courses/types'
import { Component, type ReactNode, useState } from 'react'
import {
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
  IconFilter2,
  IconLayoutGridFilled,
  IconList,
  IconUserCode,
  IconVideo,
} from '@tabler/icons-react'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import CourseDashboardQuickActions from '@/features/courses/dashboard/course-dashboard-quick-actions.tsx'
import {
  type FilterInputType,
  type FilterType,
  MultiFilter,
} from '@/components/multi-filter.tsx'
import { type FilterConfig, useFilter } from '@/hooks/useFilter.ts'
import { createFilterOption, formatTerm } from '@/utils/helpers.ts'
import {
  mockAcademicPrograms,
  mockCourseData,
  mockEnrolledCourse,
  mockTerms,
} from '@/features/courses/mocks.ts'
import { useCurrentMeeting } from '@/features/courses/hooks/useCurrentMeeting.ts'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
  loader: ({ context }) => {
    return mockTerms //TODO: replace this with actual fetch
  },
})

// Course-specific filter configuration
export const courseFilterConfig: FilterConfig<Course | EnrolledCourse> = {
  Program: (course, value) => {
    if ('programs' in course) {
      // Course
      const programCodes = course.programs.map((program) => program.programCode)
      return programCodes.map((code) => code.toLowerCase()).includes(value)
    }
    return false
  },

  Term: (course: EnrolledCourse | Course, value: string) => {
    if ('academicTerm' in course) {
      // Handle EnrolledCourse case
      if (value === 'current' && course.academicTerm.isCurrent) return true
      return (
        formatTerm(course.academicTerm).toLowerCase() === value.toLowerCase()
      )
    } else {
      // Handle Course case
      if (value === 'current') {
        return course.academicTerms.some((term) => term.isCurrent)
      }
      return course.academicTerms.some(
        (term) => formatTerm(term).toLowerCase() === value.toLowerCase(),
      )
    }
  },

  Schedule: (course: Course | EnrolledCourse, value: string) => {
    if ('section' in course) {
      return course.section.sectionSchedule.day
        .toLowerCase()
        .includes(value.toLowerCase())
    }
    return false
  },
}

function RouteComponent() {
  const { authUser } = useAuth('protected') //TODO: use this later for fetching enrolled terms
  const academicTerms = Route.useLoaderData() //TODO: replace with suspense query
  const academicPrograms = mockAcademicPrograms

  const [view, setView] = useState<'grid' | 'list'>('grid')
  //TODO: implement API call to get courses, get it by academic term Id
  const coursesData: (Course | EnrolledCourse)[] =
    authUser?.role === 'student' ? mockEnrolledCourse : mockCourseData
  const [searchFilteredCourses, setSearchFilteredCourses] =
    useState<(Course | EnrolledCourse)[]>(coursesData)

  const filters: FilterType[] = [
    {
      id: '',
      label: 'Term',
      icon: <IconCalendarTime size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Current', value: 'current' },
        ...(authUser?.role === 'student'
          ? coursesData.map((course) =>
              'academicTerm' in course
                ? createFilterOption(formatTerm(course.academicTerm))
                : { label: '', value: '' },
            )
          : academicTerms.map((term) => createFilterOption(formatTerm(term)))),
      ],
    },
    ...(authUser?.role !== 'student'
      ? [
          {
            id: '',
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
    <Container size={'lg'} w={'100%'} pb={'xl'}>
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
            {filteredData.map((course, index) =>
              view === 'grid' ? (
                <CourseCard
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={
                    useCurrentMeeting(course as EnrolledCourse).currentMeeting
                  }
                />
              ) : (
                <CourseListRow
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={
                    useCurrentMeeting(course as EnrolledCourse).currentMeeting
                  }
                />
              ),
            )}
          </Group>
          {/*Upcoming Tasks*/}
          {authUser.role === 'student' && (
            <div
              className={'self-end'}
              style={{ flexGrow: 1, flexBasis: '20%', minWidth: 250 }}
            >
              <CourseTasksSummary
                courses={filteredData as unknown as EnrolledCourse[]}
              />
            </div>
          )}
        </Group>
      </Stack>
    </Container>
  )
}

type HeaderProps = {
  coursesData: any
  onSearchFilter: (courses: Course[] | EnrolledCourse[]) => void
  filters: FilterType[]
  activeFilters: FilterType[]
  handleAddFilter: (filterType: FilterType) => void
  handleRemoveFilter: (id: string) => void
  handleFilterChange: (id: string, value: string) => void
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
        <Button
          variant={'subtle'}
          c={
            this.props.filterCount !== 0 || this.props.showFilters
              ? 'blue.6'
              : 'gray.6'
          }
          onClick={this.props.onClick}
          leftSection={<IconFilter2 size={20} />}
        >
          Filters
        </Button>
      </Tooltip>
    )
  }
}

class SelectorButton extends Component<{
  active: boolean
  icon: ReactNode
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
  onRemoveFilter: (id: string) => void
  onFilterChange: (id: string, value: string) => void
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
        activeFilters={activeFilters.map((filter) => ({
          ...filter,
          onChange: (value: string) => onFilterChange(filter.id, value),
          onRemove: () => onRemoveFilter(filter.id),
        }))}
        onAddFilter={onAddFilter}
      />
    </Group>
  )
}

interface CourseDetailProps {
  course: Course | EnrolledCourse
  currentMeeting?: ClassMeeting
  url: string
}

const CourseCard = ({ course, currentMeeting, url }: CourseDetailProps) => {
  const theme = useMantineTheme()
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
          {course.courseCode}
          {'section' in course && ` • ${course.section.sectionName}`}
        </Text>
      </Flex>
      {/*Course Details*/}
      <Group justify="space-between" wrap="nowrap" mt="xs">
        <Stack gap={'md'} w={'16rem'} px={'xs'}>
          <Stack mt={'xs'}>
            <Tooltip label={course.courseName}>
              <Link to={url} className="hover:underline">
                <Title
                  order={3}
                  w={'100%'}
                  lineClamp={1}
                  c={theme.primaryColor}
                >
                  {course.courseName}
                </Title>
              </Link>
            </Tooltip>
            {'section' in course && (
              <Text fw={400} size={'sm'} c={theme.colors.dark[3]}>
                {course.section.sectionSchedule.day}{' '}
                {course.section.sectionSchedule.time}
              </Text>
            )}
          </Stack>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={course.courseCode}
          />
          <Group justify="space-between">
            <Group gap="0.25rem">
              {'courseProgress' in course && (
                <>
                  <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                    Completed
                  </Text>
                  <Group gap="0">
                    <RingProgress
                      size={20}
                      thickness={3}
                      sections={[
                        {
                          value: course.courseProgress * 100,
                          color: theme.colors.blue[5],
                        },
                      ]}
                    />
                    <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                      {course.courseProgress * 100}%
                    </Text>
                  </Group>
                </>
              )}
            </Group>
            <CourseDashboardQuickActions />
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

const CourseListRow = ({ course, currentMeeting, url }: CourseDetailProps) => {
  const theme = useMantineTheme()

  return (
    <Card
      radius="md"
      p="0"
      px={'md'}
      className={'drop-shadow-sm hover:drop-shadow-lg'}
      w={'100%'}
      style={{
        borderLeft: `4px solid ${theme.colors.primary[0]}`,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack w={'65%'} p={'xs'} justify={'space-between'}>
          <Group gap={'xs'}>
            <Link to={url} className="hover:underline">
              <Title order={3} lineClamp={1} c={'primary'}>
                {course.courseName}
              </Title>
            </Link>
            <CourseDashboardQuickActions />
          </Group>
          <Text fw={400} size={'sm'} c={'dark.3'}>
            {course.courseCode}{' '}
            {'section' in course && (
              <>
                • {course.section.sectionName} |{' '}
                {course.section.sectionSchedule.day}{' '}
                {course.section.sectionSchedule.time}
              </>
            )}
          </Text>
        </Stack>
        <Stack w={'30%'} p={'xs'} justify={'space-between'}>
          <CourseCardActionButton
            currentMeeting={currentMeeting}
            courseCode={course.courseCode}
          />
          <Group gap="xs">
            <Text fw={500} size={'xs'} c={'dark.3'}>
              Completed:
            </Text>
            <Progress color={'blue.5'} value={50} w={'50%'} />
            {'courseProgress' in course && (
              <Text fw={500} size={'xs'} c={'dark.3'}>
                {course.courseProgress * 100}%
              </Text>
            )}
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
  const navigate = useNavigate()
  return (
    <Button
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
      onClick={() => {
        authUser.role === 'student'
          ? window.open(currentMeeting?.meetingLink!, '_blank')
          : navigate({
              from: '/cms',
              to: '/cms/$courseCode',
              params: { courseCode },
            })
      }}
    >
      {authUser.role === 'student'
        ? 'Join Meeting'
        : authUser.role === 'mentor'
          ? 'Start Meeting'
          : 'Manage Content'}
    </Button>
  )
}

// Course-specific filter configuration
import { type FilterConfig, useFilter } from '@/hooks/useFilter.ts'
import type { EnrolledCourse } from '@/features/courses/types.ts'
import { createFilterOption, formatTerm } from '@/utils/helpers.ts'
import { useState } from 'react'
import type { FilterType } from '@/components/multi-filter.tsx'
import { useCurrentMeeting } from '@/features/courses/hooks/useCurrentMeeting.ts'
import { Container, Group, Stack } from '@mantine/core'
import { IconCalendarTime } from '@tabler/icons-react'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item.tsx'
import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header.tsx'

export const studentCourseFilterConfig: FilterConfig<EnrolledCourse> = {
  Term: (course, value) => {
    if (value === 'current') {
      return course.academicTerm?.isCurrent ?? false
    }
    return course.academicTerm?.term === value
  },
}

type StudentDashboardProps = {
  coursesData: EnrolledCourse[]
}

const StudentCourseDashboard = ({ coursesData }: StudentDashboardProps) => {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchFilteredCourses, setSearchFilteredCourses] =
    useState<EnrolledCourse[]>(coursesData)

  const academicTermOptions = Array.from(
    new Set(coursesData.map((course) => formatTerm(course.academicTerm))),
  ).map((term) => createFilterOption(term))

  const filters: FilterType[] = [
    {
      id: '',
      label: 'Term',
      icon: <IconCalendarTime size={16} />,
      type: 'select',
      value: '',
      options: [{ label: 'Current', value: 'current' }, ...academicTermOptions],
    },
  ]

  const defaultFilters: FilterType[] = [{ ...filters[0], value: 'current' }]

  const [showFilters, setShowFilters] = useState(true)

  const {
    activeFilters,
    filteredData, // 👈 EnrolledCourse[]
    activeFilterCount,
    handleAddFilter,
    handleRemoveFilter,
    handleFilterChange,
  } = useFilter<EnrolledCourse>(
    defaultFilters,
    searchFilteredCourses,
    studentCourseFilterConfig,
  )

  return (
    <Container size="lg" w="100%" pb="xl">
      <Stack gap="lg">
        <CourseDashboardHeader
          coursesData={coursesData}
          filters={filters}
          activeFilters={activeFilters}
          onSearchFilter={setSearchFilteredCourses}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleFilterChange={handleFilterChange}
          showFilters={showFilters}
          onToggleShowFilter={setShowFilters}
          activeFilterCount={activeFilterCount}
          view={view}
          onViewChange={setView}
        />
        <Group wrap="wrap-reverse" align="start" gap="md" w="100%">
          <Group
            wrap="wrap"
            gap="md"
            style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
          >
            {filteredData.map((course, index) =>
              view === 'grid' ? (
                <CourseCard
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={useCurrentMeeting(course).currentMeeting}
                />
              ) : (
                <CourseListRow
                  key={index}
                  url={`/courses/${course.courseCode}`}
                  course={course}
                  currentMeeting={useCurrentMeeting(course).currentMeeting}
                />
              ),
            )}
          </Group>
          <div
            className="self-end"
            style={{ flexGrow: 1, flexBasis: '20%', minWidth: 250 }}
          >
            <CourseTasksSummary courses={filteredData} />
          </div>
        </Group>
      </Stack>
    </Container>
  )
}

export default StudentCourseDashboard

import type { FilterType } from '@/components/multi-filter.tsx'
import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header.tsx'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item.tsx'
import type {
  AcademicProgram,
  AcademicTerm,
  Course,
} from '@/features/courses/types.ts'
import { type FilterConfig, useFilter } from '@/hooks/useFilter.ts'
import { createFilterOption, formatTerm } from '@/utils/helpers.ts'
import { Container, Group, Stack } from '@mantine/core'
import { IconCalendarTime, IconUserCode } from '@tabler/icons-react'
import { useState } from 'react'

type MentorAdminDashboardProps = {
  academicTerms: AcademicTerm[]
  academicPrograms: AcademicProgram[]
  coursesData: Course[]
}

export const adminCourseFilterConfig: FilterConfig<Course> = {
  Term: (course, value) => {
    if (value === 'current') {
      return course.academicTerms.some((term) => term.isCurrent)
    }
    return course.academicTerms.some((term) => term.term === value)
  },
  Program: (course, value) => {
    return course.programs.some(
      (program) => program.programCode.toLowerCase() === value.toLowerCase(),
    )
  },
}

const MentorAdminDashboardPage = ({
  academicTerms,
  academicPrograms,
  coursesData,
}: MentorAdminDashboardProps) => {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchFilteredCourses, setSearchFilteredCourses] =
    useState<Course[]>(coursesData)

  const filters: FilterType[] = [
    {
      id: '',
      label: 'Term',
      icon: <IconCalendarTime size={16} />,
      type: 'select',
      value: '',
      options: [
        { label: 'Current', value: 'current' },
        ...academicTerms.map((term) => createFilterOption(formatTerm(term))),
      ],
    },
    {
      id: '',
      label: 'Program',
      icon: <IconUserCode size={16} />,
      type: 'select',
      value: '',
      options: [
        ...academicPrograms.map((program) =>
          createFilterOption(program.programCode),
        ),
      ],
    },
  ]

  const defaultFilters: FilterType[] = [{ ...filters[0], value: 'current' }]

  const [showFilters, setShowFilters] = useState(true)

  const {
    activeFilters,
    filteredData, // 👈 Course[]
    activeFilterCount,
    handleAddFilter,
    handleRemoveFilter,
    handleFilterChange,
  } = useFilter<Course>(
    defaultFilters,
    searchFilteredCourses,
    adminCourseFilterConfig,
  )

  return (
    <Container size="md" w="100%" pb="xl">
      <Stack gap="lg">
        <CourseDashboardHeader
          coursesData={coursesData}
          filters={filters}
          activeFilters={activeFilters}
          onSearchFilter={setSearchFilteredCourses}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleFilterChange={handleFilterChange}
          view={view}
          onViewChange={setView}
        />
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
              />
            ) : (
              <CourseListRow
                key={index}
                url={`/courses/${course.courseCode}`}
                course={course}
              />
            ),
          )}
        </Group>
      </Stack>
    </Container>
  )
}

export default MentorAdminDashboardPage

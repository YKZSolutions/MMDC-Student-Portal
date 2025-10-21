import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item.tsx'
import { CourseListSuspense } from '@/features/courses/suspense'
import type { Course } from '@/features/courses/types.ts'
import { type FilterConfig } from '@/hooks/useFilter.ts'
import type {
  DetailedModulesDto,
  EnrollmentPeriodDto,
} from '@/integrations/api/client'
import { lmsControllerFindAllForAdminOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatMetaToPagination } from '@/utils/formatters'
import { Container, Group, Stack } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Suspense, useState, type ReactNode } from 'react'

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

function AdminCourseDashboardProvider({
  children,
  props = {
    search: '',
    term: '',
    page: 1,
  },
}: {
  children: (props: {
    modules: DetailedModulesDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: {
    search?: string
    term?: string
    page: number
  }
}) {
  const { search, term, page } = props

  const { data: moduleData } = useSuspenseQuery(
    lmsControllerFindAllForAdminOptions({
      query: {
        search: search || undefined,
        page: page,
        enrollmentPeriodId: term || undefined,
      },
    }),
  )

  const modules = moduleData.modules

  const { totalPages, message } = formatMetaToPagination({
    limit: 10,
    page,
    meta: moduleData.meta,
  })

  return children({
    modules,
    message,
    totalPages,
  })
}

function AdminCourseDashboardPage() {
  const searchParam: {
    search: string
    term: EnrollmentPeriodDto['id']
    page: number
  } = useSearch({ strict: false })
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const queryDefaultValues = {
    search: searchParam.search || '',
    term: searchParam.term || '',
    page: 1,
  }

  return (
    <Container size="md" w="100%" pb="xl">
      <Stack gap="lg">
        <CourseDashboardHeader view={view} onViewChange={setView} />
        <Group
          wrap="wrap"
          gap="md"
          style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
        >
          <Suspense fallback={<CourseListSuspense />}>
            <AdminCourseDashboardProvider props={queryDefaultValues}>
              {({ modules }) =>
                modules.map((moduleData, index) =>
                  view === 'grid' ? (
                    <CourseCard
                      key={moduleData.id}
                      url={`/lms/${moduleData.id}`}
                      course={moduleData.course || undefined}
                    />
                  ) : (
                    <CourseListRow
                      key={moduleData.id}
                      url={`/lms/${moduleData.id}`}
                      course={moduleData.course || undefined}
                    />
                  ),
                )
              }
            </AdminCourseDashboardProvider>
          </Suspense>
        </Group>
      </Stack>
    </Container>
  )
}

export default AdminCourseDashboardPage

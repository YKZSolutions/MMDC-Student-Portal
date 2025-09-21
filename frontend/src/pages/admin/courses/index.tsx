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
import {
  enrollmentControllerFindActiveEnrollmentOptions,
  lmsControllerFindAllForAdminOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatPaginationMessage } from '@/utils/formatters'
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
    enrollmentPeriodData: EnrollmentPeriodDto
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

  const { data: enrollmentPeriodData } = useSuspenseQuery(
    enrollmentControllerFindActiveEnrollmentOptions(),
  )

  // const { data: courseData } = useSuspenseQuery(
  //   courseOfferingControllerFindCourseOfferingsByPeriodOptions({
  //     query: {
  //       page: page,
  //       search: search || undefined,
  //     },
  //     path: {
  //       enrollmentId: term || enrollmentPeriodData.id,
  //     },
  //   }),
  // )

  const { data: moduleData } = useSuspenseQuery(
    lmsControllerFindAllForAdminOptions({
      query: {
        search: search || undefined,
        page: page,
      },
    }),
  )

  console.log(moduleData)

  const modules = moduleData.modules

  const limit = 10
  const total = modules.length
  const totalPages = 1

  const message = formatPaginationMessage({
    page,
    total,
    limit,
  })

  return children({
    enrollmentPeriodData,
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
                      url={`/courses/${moduleData.id}`}
                      course={moduleData.courseOffering?.course}
                    />
                  ) : (
                    <CourseListRow
                      key={moduleData.id}
                      url={`/courses/${moduleData.id}`}
                      course={moduleData.courseOffering?.course}
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

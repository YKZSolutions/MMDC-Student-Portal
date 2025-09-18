import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item.tsx'
import { CourseListSuspense } from '@/features/courses/suspense'
import type { Course } from '@/features/courses/types.ts'
import { type FilterConfig } from '@/hooks/useFilter.ts'
import type {
  DetailedCourseOfferingDto,
  EnrollmentPeriodDto,
} from '@/integrations/api/client'
import {
  courseOfferingControllerFindCourseOfferingsByPeriodOptions,
  enrollmentControllerFindActiveEnrollmentOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatPaginationMessage } from '@/utils/formatters'
import { Container, Group, Stack } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
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
    page: 1,
  },
}: {
  children: (props: {
    enrollmentPeriodData: EnrollmentPeriodDto
    courseOfferings: DetailedCourseOfferingDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: {
    search?: string
    page: number
  }
}) {
  const { search, page } = props

  const { data: enrollmentPeriodData } = useSuspenseQuery(
    enrollmentControllerFindActiveEnrollmentOptions(),
  )

  const { data: courseData } = useSuspenseQuery(
    courseOfferingControllerFindCourseOfferingsByPeriodOptions({
      query: {
        page: page,
        search: search || undefined,
      },
      path: {
        enrollmentId: enrollmentPeriodData.id,
      },
    }),
  )

  const courseOfferings = courseData.courseOfferings

  const limit = 10
  const total = courseOfferings.length
  const totalPages = 1

  const message = formatPaginationMessage({
    page,
    total,
    limit,
  })

  console.log(courseOfferings)

  return children({
    enrollmentPeriodData,
    courseOfferings,
    message,
    totalPages,
  })
}

function AdminCourseDashboardPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')

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
            <AdminCourseDashboardProvider>
              {({ courseOfferings }) =>
                courseOfferings.map((course, index) =>
                  course.courseSections.map((section) =>
                    view === 'grid' ? (
                      <CourseCard
                        key={section.id}
                        url={`/courses/${section.id}`}
                        course={course.course}
                        section={section}
                      />
                    ) : (
                      <CourseListRow
                        key={section.id}
                        url={`/courses/${section.id}`}
                        section={section}
                        course={course.course}
                      />
                    ),
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

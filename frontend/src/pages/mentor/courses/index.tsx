// Course-specific filter configuration
import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header.tsx'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item'
import { CourseListSuspense } from '@/features/courses/suspense'
import type { EnrolledCourse } from '@/features/courses/types.ts'
import { type FilterConfig } from '@/hooks/useFilter.ts'
import type { DetailedCourseEnrollmentDto } from '@/integrations/api/client'
import { courseEnrollmentControllerGetCourseEnrollmentsOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatPaginationMessage } from '@/utils/formatters'
import { Container, Group, Stack } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'

export const mentorCourseFilterConfig: FilterConfig<EnrolledCourse> = {
  Term: (course, value) => {
    if (value === 'current') {
      return course.academicTerm?.isCurrent ?? false
    }
    return course.academicTerm?.term === value
  },
}

function MentorCourseDashboardProvider({
  children,
  props = {
    search: '',
    page: 1,
  },
}: {
  children: (props: {
    courseOfferings: DetailedCourseEnrollmentDto[]
    message: string
    totalPages: number
  }) => ReactNode
  props?: {
    search?: string
    page: number
  }
}) {
  const { search, page } = props

  const { data: courseData } = useSuspenseQuery(
    courseEnrollmentControllerGetCourseEnrollmentsOptions(),
  )

  const courseOfferings = courseData

  const limit = 10
  const total = courseOfferings.length
  const totalPages = 1

  const message = formatPaginationMessage({
    page,
    total,
    limit,
  })


  return children({
    courseOfferings,
    message,
    totalPages,
  })
}

const MentorCourseDashboardPage = () => {
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
            <MentorCourseDashboardProvider>
              {({ courseOfferings }) =>
                courseOfferings.map((course, index) =>
                  view === 'grid' ? (
                    <CourseCard
                      key={course.id}
                      url={`/courses/${course.courseSection!.id}`}
                      section={course.courseSection!}
                      course={course.courseOffering?.course!}
                      currentMeeting={{
                        endTime: '2024-12-31T23:59:00Z',
                        meetingLink: 'https://example.com/meeting',
                        startTime: '2024-12-31T22:59:00Z',
                      }}
                    />
                  ) : (
                    <CourseListRow
                      key={course.id}
                      url={`/courses/${course.courseSection!.id}`}
                      section={course.courseSection!}
                      course={course.courseOffering?.course!}
                      currentMeeting={{
                        endTime: '2024-12-31T23:59:00Z',
                        meetingLink: 'https://example.com/meeting',
                        startTime: '2024-12-31T22:59:00Z',
                      }}
                    />
                  ),
                )
              }
            </MentorCourseDashboardProvider>
          </Suspense>
        </Group>
      </Stack>
    </Container>
  )
}

export default MentorCourseDashboardPage

// Course-specific filter configuration
import CourseDashboardHeader from '@/features/courses/dashboard/course-dashboard-header.tsx'
import {
  CourseCard,
  CourseListRow,
} from '@/features/courses/dashboard/course-dashboard-item'
import { CourseListSuspense } from '@/features/courses/suspense'
import type { EnrolledCourse } from '@/features/courses/types.ts'
import { type FilterConfig } from '@/hooks/useFilter.ts'
import type { DetailedModulesDto } from '@/integrations/api/client'
import { lmsControllerFindAllForStudentOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatMetaToPagination } from '@/utils/formatters'
import { Container, Group, Stack } from '@mantine/core'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'

export const studentCourseFilterConfig: FilterConfig<EnrolledCourse> = {
  Term: (course, value) => {
    if (value === 'current') {
      return course.academicTerm?.isCurrent ?? false
    }
    return course.academicTerm?.term === value
  },
}

function StudentCourseDashboardProvider({
  children,
  props = {
    search: '',
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
    page: number
  }
}) {
  const { search, page } = props

  const { data: moduleData } = useSuspenseQuery(
    lmsControllerFindAllForStudentOptions({
      query: {
        search: search || undefined,
        page: page,
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

const StudentCourseDashboardPage = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid')

  return (
    <Container size="md" w="100%" pb="xl">
      <Stack gap="lg">
        <CourseDashboardHeader view={view} onViewChange={setView} />
        <Group wrap="wrap-reverse" align="start" gap="md" w="100%">
          <Group
            wrap="wrap"
            gap="md"
            style={{ flexGrow: 1, flexBasis: '70%', minWidth: 300 }}
          >
            <Suspense fallback={<CourseListSuspense />}>
              <StudentCourseDashboardProvider>
                {({ modules }) =>
                  modules.map((moduleData, index) =>
                    view === 'grid' ? (
                      <CourseCard
                        key={moduleData.id}
                        url={`/lms/${moduleData.id}`}
                        course={moduleData.course!}
                        section={moduleData.courseOffering?.courseSections?.[0]}
                        currentMeeting={{
                          endTime: '2024-12-31T23:59:00Z',
                          meetingLink: 'https://example.com/meeting',
                          startTime: '2024-12-31T22:59:00Z',
                        }}
                      />
                    ) : (
                      <CourseListRow
                        key={moduleData.id}
                        url={`/lms/${moduleData.id}`}
                        course={moduleData.course!}
                        section={moduleData.courseOffering?.courseSections?.[0]}
                        currentMeeting={{
                          endTime: '2024-12-31T23:59:00Z',
                          meetingLink: 'https://example.com/meeting',
                          startTime: '2024-12-31T22:59:00Z',
                        }}
                      />
                    ),
                  )
                }
              </StudentCourseDashboardProvider>
            </Suspense>
          </Group>
          {/* <Box
            className="self-end"
            style={{ flexGrow: 1, flexBasis: '20%', minWidth: 250 }}
          >
            <CourseTasksSummary courses={} />
          </Box> */}
        </Group>
      </Stack>
    </Container>
  )
}

export default StudentCourseDashboardPage

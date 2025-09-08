import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/auth.hook.ts'
import {
  mockAcademicPrograms,
  mockCourseData,
  mockTerms,
} from '@/features/courses/mocks.ts'
import CourseDashboard from '@/pages/shared/courses/course-dashboard.tsx'

export const Route = createFileRoute('/(protected)/courses/')({
  component: RouteComponent,
  loader: ({ context }) => {
    return {
      terms: mockTerms,
      academicPrograms: mockAcademicPrograms,
      courses: mockCourseData,
    } //TODO: replace this with actual fetch
  },
})

function RouteComponent() {
  const { authUser } = useAuth('protected') //TODO: use this later for fetching enrolled terms
  const academicTerms = Route.useLoaderData().terms //TODO: replace with suspense query
  const academicPrograms = Route.useLoaderData().academicPrograms
  const coursesData = Route.useLoaderData().courses

  return (
    <CourseDashboard
      role={authUser.role}
      academicTerms={academicTerms}
      academicPrograms={academicPrograms}
      coursesData={coursesData}
    />
  )
}

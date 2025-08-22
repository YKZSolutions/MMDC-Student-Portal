import { createFileRoute } from '@tanstack/react-router'
import CourseGradesPage from '@/pages/student/courses/$courseId/grades/course-grades.tsx'
import CourseOverviewStudentView from '@/pages/student/courses/$courseId/course-overview.tsx'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'

export const Route = createFileRoute('/(protected)/courses/$courseId/grades/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseGradesPage />
}

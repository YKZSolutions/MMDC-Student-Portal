import { createFileRoute } from '@tanstack/react-router'
import CourseAssignmentsPage from '@/pages/student/courses/$courseId/assignments/course-assignments.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import GradesPageStudentView from '@/pages/student/courses/$courseId/grades/course-grades.tsx'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <CourseAssignmentsPage/>
}

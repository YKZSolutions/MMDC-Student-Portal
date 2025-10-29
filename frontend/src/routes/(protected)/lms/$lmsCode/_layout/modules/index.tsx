import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ModulesMentorPage from '@/pages/mentor/lms/$lmsCode/modules'
import LMSModuleListPage from '@/pages/shared/lms/modules/lms-module-list.page'
import ModulesStudentPage from '@/pages/student/lms/$lmsCode/modules'
import { createFileRoute } from '@tanstack/react-router'
import z from 'zod'

const lmsModuleListStateSearchSchema = z.object({
  createSection: z.boolean().optional(),
  updateSection: z.uuidv4().optional(),
  createSubsection: z.uuidv4().optional(),
  updateSubsection: z.uuidv4().optional(),
  createContent: z.uuidv4().optional(),
  updateContent: z.uuidv4().optional(),
})

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/',
)({
  component: RouteComponent,
  validateSearch: lmsModuleListStateSearchSchema,
})

function RouteComponent() {
  return <LMSModuleListPage />
}

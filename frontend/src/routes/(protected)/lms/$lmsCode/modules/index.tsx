import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import { getMockModuleByRole, mockModule } from '@/features/courses/mocks.ts'
import ModulesAdminPage from '@/pages/admin/lms/$lmsCode/modules'
import ModulesMentorPage from '@/pages/mentor/lms/$lmsCode/modules'
import ModulesStudentPage from '@/pages/student/lms/$lmsCode/modules'
import { Box } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/modules/',
)({
  component: RouteComponent,
  loader: async ({ context }) => {
    return mockModule //TODO: replace with actual fetch
  },
})

function RouteComponent() {
  const { authUser } = useAuth('protected')
  const navigate = Route.useNavigate()
  const [allExpanded, setAllExpanded] = useState(false)
  const module = getMockModuleByRole(authUser.role) //TODO: replace with actual data

  const toggleExpandAll = () => setAllExpanded((prev) => !prev)
  const handleAddContent = () => navigate({ to: './create' })

  return (
    <Box p="md">
      <RoleComponentManager
        currentRole={authUser.role}
        roleRender={{
          student: <ModulesStudentPage />,
          mentor: <ModulesMentorPage />,
          admin: <ModulesAdminPage />,
        }}
      />
    </Box>
  )
}

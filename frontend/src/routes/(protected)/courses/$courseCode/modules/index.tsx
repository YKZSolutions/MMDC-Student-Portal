import { createFileRoute } from '@tanstack/react-router'
import { getMockModuleByRole, mockModule } from '@/features/courses/mocks.ts'
import { useAuth } from '@/features/auth/auth.hook.ts'
import React, { useState } from 'react'
import { Box } from '@mantine/core'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { AdminModuleView } from '@/features/courses/modules/admin/admin-module-view.tsx'
import { MentorModuleView } from '@/features/courses/modules/mentor/mentor-module-view.tsx'
import { StudentModuleView } from '@/features/courses/modules/student/student-module-view.tsx'
import type { StudentModule } from '@/features/courses/modules/student/types.ts'
import type { MentorModule } from '@/features/courses/modules/mentor/types.ts'
import type { AdminModule } from '@/features/courses/modules/admin/types.ts'

export const Route = createFileRoute(
  '/(protected)/courses/$courseCode/modules/',
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
          student: <StudentModuleView module={module as StudentModule} />,
          mentor: <MentorModuleView module={module as MentorModule} />,
          admin: (
            <AdminModuleView
              module={module as AdminModule}
              onAddContent={handleAddContent}
              onExpandAll={toggleExpandAll}
              allExpanded={allExpanded}
            />
          ),
        }}
      />
    </Box>
  )
}

import { useAuth } from '@/features/auth/auth.hook'
import { getMockModuleByRole } from '@/features/courses/mocks'
import type { AdminModule } from '@/features/courses/modules/admin/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import { Box, Button, Group } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

const route = getRouteApi('/(protected)/courses/$courseCode/modules/')

interface ModulesAdminPageProps {
  module: AdminModule
  onAddContent: () => void
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesAdminPage() {
  const { authUser } = useAuth('protected')
  const navigate = route.useNavigate()
  const [allExpanded, setAllExpanded] = useState(false)
  const module = getMockModuleByRole(authUser.role) //TODO: replace with actual data

  const toggleExpandAll = () => setAllExpanded((prev) => !prev)
  const handleAddContent = () => {
    navigate({
      to: './create',
    })
  }

  return (
    <Box>
      {/* Admin Actions Header */}
      <Group align={'center'} justify="end" mb="lg">
        <Group>
          <Button radius={"md"} onClick={toggleExpandAll} variant="default">
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button radius={"md"} leftSection={<IconPlus />} onClick={handleAddContent}>
            Add New Content
          </Button>
        </Group>
      </Group>

      {/* Module Content with admin actions */}
      <ModulePanel module={module} viewMode="admin" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesAdminPage

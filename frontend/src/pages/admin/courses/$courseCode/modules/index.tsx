import type { AdminModule } from '@/features/courses/modules/admin/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import { Box, Button, Group, useMantineTheme } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

interface ModulesAdminPageProps {
  module: AdminModule
  onAddContent: () => void
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesAdminPage({
  module,
  onAddContent,
  onExpandAll,
  allExpanded,
}: ModulesAdminPageProps) {
  const theme = useMantineTheme()
  return (
    <Box>
      {/* Admin Actions Header */}
      <Group align={'center'} justify="end" mb="lg">
        <Group>
          <Button onClick={onExpandAll} variant="default">
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button leftSection={<IconPlus />} onClick={onAddContent}>
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

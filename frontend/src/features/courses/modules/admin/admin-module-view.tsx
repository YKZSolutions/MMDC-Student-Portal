import React from 'react'
import { Box, Button, Group, useMantineTheme } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import type { AdminModule } from '@/features/courses/modules/admin/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'

interface AdminModuleViewProps {
  module: AdminModule
  onAddContent: () => void
  onExpandAll: () => void
  allExpanded: boolean
}

export const AdminModuleView = ({
  module,
  onAddContent,
  onExpandAll,
  allExpanded,
}: AdminModuleViewProps) => {
  const theme = useMantineTheme()
  return (
    <Box>
      {/* Admin Actions Header */}
      <Group justify="space-between" mb="lg">
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
      <ModulePanel module={module} viewMode="admin" />
    </Box>
  )
}

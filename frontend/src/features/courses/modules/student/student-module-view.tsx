import React from 'react'
import { Box, Group, Progress, Text, useMantineTheme } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import type { StudentModule } from '@/features/courses/modules/student/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'

interface StudentModuleViewProps {
  module: StudentModule
}

export const StudentModuleView = ({ module }: StudentModuleViewProps) => {
  const theme = useMantineTheme()
  const { studentProgress } = module

  return (
    <Box>
      {/* Progress Overview */}
      <Box mb="lg">
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>
            Your Progress
          </Text>
          <Text size="sm" c="dimmed">
            {studentProgress.completedItems}/{studentProgress.totalItems}{' '}
            completed
          </Text>
        </Group>
        <Progress
          value={studentProgress.overallProgress}
          size="lg"
          radius="xl"
          color={studentProgress.overallProgress === 100 ? 'green' : 'blue'}
        />

        {/* Quick Stats */}
        <Group mt="sm" gap="xl">
          <Group gap="xs">
            <IconCheck size={16} color={theme.colors.green[6]} />
            <Text size="sm">{studentProgress.completedItems} Completed</Text>
          </Group>
          {studentProgress.overdueItems > 0 && (
            <Group gap="xs">
              <IconAlertCircle size={16} color={theme.colors.red[6]} />
              <Text size="sm" c="red">
                {studentProgress.overdueItems} Overdue
              </Text>
            </Group>
          )}
        </Group>
      </Box>

      {/* Module Content */}
      <ModulePanel module={module} viewMode="student" />
    </Box>
  )
}

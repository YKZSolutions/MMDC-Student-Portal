import type { MentorModule } from '@/features/courses/modules/mentor/types.ts'
import {
  Box,
  Card,
  Group,
  Progress,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import React from 'react'
import { IconChartBar } from '@tabler/icons-react'

interface MentorModuleViewProps {
  module: MentorModule
  onExpandAll: () => void
  allExpanded: boolean
}

export const MentorModuleView = ({
  module,
  onExpandAll,
  allExpanded,
}: MentorModuleViewProps) => {
  const theme = useMantineTheme()
  return (
    <Box>
      {/* Section Statistics */}
      <Group gap="md" mb="md">
        {module.sectionStats.map((stat) => (
          <Card key={stat.sectionId} shadow="sm" p="md">
            <Text size="sm" fw={500} mb="xs">
              Section Progress
            </Text>
            <Progress value={stat.averageProgress} size="lg" mb="xs" />
            <Text size="sm" c="dimmed">
              {stat.completedStudents}/{stat.totalStudents} students completed
            </Text>
          </Card>
        ))}
      </Group>

      <Box mb="lg">
        <Title order={4}>Section Statistics</Title>
        <Group gap="md">
          {module.sectionStats.map((stat) => (
            <Card key={stat.sectionId} shadow="sm" p="md" withBorder>
              <Group>
                <ThemeIcon variant="light" size="lg" color="blue">
                  <IconChartBar size={16} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={500}>
                    Section Progress
                  </Text>
                  <Progress value={stat.averageProgress} size="sm" mt="xs" />
                  <Text size="xs" c="dimmed" mt="xs">
                    {stat.completedStudents}/{stat.totalStudents} students
                    completed
                  </Text>
                </Box>
              </Group>
            </Card>
          ))}
        </Group>
      </Box>

      {/* Module Content with mentor-specific actions */}
      <ModulePanel
        module={module}
        viewMode="mentor"
        allExpanded={allExpanded}
      />
    </Box>
  )
}

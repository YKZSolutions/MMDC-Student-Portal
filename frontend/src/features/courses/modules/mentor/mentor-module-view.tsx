import type { MentorModule } from '@/features/courses/modules/mentor/types.ts'
import {
  Box,
  Card,
  Group,
  Progress,
  Text,
  useMantineTheme,
} from '@mantine/core'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'

interface MentorModuleViewProps {
  module: MentorModule
}

export const MentorModuleView = ({ module }: MentorModuleViewProps) => {
  const theme = useMantineTheme()
  return (
    <Box>
      {/* Section Statistics */}
      <Group gap="md" mb="lg">
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

      {/* Module Content with mentor-specific actions */}
      <ModulePanel module={module} viewMode="mentor" />
    </Box>
  )
}

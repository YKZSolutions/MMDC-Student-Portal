import { useAuth } from '@/features/auth/auth.hook'
import { getMockModuleByRole } from '@/features/courses/mocks'
import type { MentorModule } from '@/features/courses/modules/mentor/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
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
import { IconChartBar } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

interface ModulesMentorPageProps {
  module: MentorModule
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesMentorPage() {
  const theme = useMantineTheme()
  const { authUser } = useAuth('protected')
  const navigate = useNavigate()
  const [allExpanded, setAllExpanded] = useState(true)
  const module = getMockModuleByRole(authUser.role) as MentorModule

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
      <ModulePanel viewMode="mentor" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesMentorPage

import { useAuth } from '@/features/auth/auth.hook'
import { getMockModuleByRole } from '@/features/courses/mocks'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import type { StudentModule } from '@/features/courses/modules/student/types.ts'
import {
  Box,
  Button,
  Group,
  Progress,
  rem,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { useState } from 'react'

interface ModulesStudentPageProps {
  module: StudentModule
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesStudentPage() {
  const theme = useMantineTheme()
  const { authUser } = useAuth('protected')
  const [allExpanded, setAllExpanded] = useState(true)
  const module = getMockModuleByRole(authUser.role) //TODO: replace with actual data
  const { studentProgress } = module as StudentModule

  const toggleExpandAll = () => setAllExpanded((prev) => !prev)

  return (
    <Box>
      {/* Progress Overview */}
      <Box mb="lg">
        <Group align="start" justify="space-between" mb="xs">
          <Stack gap={rem(5)}>
            <Title c="dark.7" variant="hero" order={2} fw={700}>
              Modules
            </Title>
            <Text size="sm" c="dimmed">
              {studentProgress.completedItems}/{studentProgress.totalItems}{' '}
              completed
            </Text>
          </Stack>
          <Button onClick={toggleExpandAll} variant="default">
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
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
      <ModulePanel viewMode="student" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesStudentPage

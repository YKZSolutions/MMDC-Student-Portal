import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import type { StudentModule } from '@/features/courses/modules/student/types.ts'
import {
    Box,
    Button,
    Group,
    Progress,
    Stack,
    Text,
    useMantineTheme,
} from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'

interface ModulesStudentPageProps {
  module: StudentModule
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesStudentPage({
  module,
  onExpandAll,
  allExpanded,
}: ModulesStudentPageProps) {
  const theme = useMantineTheme()
  const { studentProgress } = module

  return (
    <Box>
      {/* Progress Overview */}
      <Box mb="lg">
        <Group align="start" justify="space-between" mb="xs">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              My Progress
            </Text>
            <Text size="sm" c="dimmed">
              {studentProgress.completedItems}/{studentProgress.totalItems}{' '}
              completed
            </Text>
          </Stack>
          <Button onClick={onExpandAll} variant="default">
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
      <ModulePanel
        module={module}
        viewMode="student"
        allExpanded={allExpanded}
      />
    </Box>
  )
}

export default ModulesStudentPage
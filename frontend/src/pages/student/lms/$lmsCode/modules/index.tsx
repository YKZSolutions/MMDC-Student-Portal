import ModulePanel from '@/features/courses/modules/module-panel.tsx'
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
import { IconAlertCircle, IconCheck, IconFlagOff } from '@tabler/icons-react'
import { type ReactNode, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { lmsControllerGetModuleProgressOverviewOptions } from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import type { ModuleProgressOverview } from '@/integrations/api/client'

export function ModuleProgressQueryProvider({
  children,
}: {
  children: (props: { moduleProgress: ModuleProgressOverview }) => ReactNode
}) {
  const { lmsCode } = useParams({ strict: false })

  const { data } = useSuspenseQuery(
    lmsControllerGetModuleProgressOverviewOptions({
      path: {
        id: lmsCode || '',
      },
    }),
  )

  console.log('Content Progresses:', data)

  return children({
    moduleProgress: data,
  })
}

function ModulesStudentPage() {
  const theme = useMantineTheme()
  const [allExpanded, setAllExpanded] = useState(true)

  const toggleExpandAll = () => setAllExpanded((prev) => !prev)

  return (
    <Box>
      {/* Progress Overview */}
      <ModuleProgressQueryProvider>
        {({ moduleProgress }) => (
          <Box mb="lg">
            <Group align="start" justify="space-between" mb="xs">
              <Stack gap={rem(5)}>
                <Title c="dark.7" variant="hero" order={2} fw={700}>
                  Modules
                </Title>
                <Text size="sm" c="dimmed">
                  {moduleProgress.totalContentItems} Content Items
                </Text>
              </Stack>
              <Button onClick={toggleExpandAll} variant="default">
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </Button>
            </Group>
            <Progress
              value={moduleProgress.progressPercentage}
              size="lg"
              radius="xl"
              color={
                moduleProgress.progressPercentage === 100 ? 'green' : 'blue'
              }
            />

            {/* Quick Stats */}
            <Group mt="sm" gap="xl">
              <Group gap="xs">
                <IconCheck size={16} color={theme.colors.green[6]} />
                <Text size="sm">
                  {moduleProgress.completedContentItems} Completed
                </Text>
              </Group>
              <Group gap="xs">
                <IconFlagOff size={16} color={theme.colors.gray[6]} />
                <Text size="sm">
                  {moduleProgress.notStartedContentItems} Not Started
                </Text>
              </Group>
              {moduleProgress.overdueAssignmentsCount &&
                moduleProgress.overdueAssignmentsCount > 0 && (
                  <Group gap="xs">
                    <IconAlertCircle size={16} color={theme.colors.red[6]} />
                    <Text size="sm" c="red">
                      {moduleProgress.overdueAssignmentsCount} Overdue
                    </Text>
                  </Group>
                )}
            </Group>
          </Box>
        )}
      </ModuleProgressQueryProvider>

      {/* Module Content */}
      <ModulePanel viewMode="student" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesStudentPage
